
import { Router } from 'express';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

// View current user's bookings
router.get('/mine', async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id
    })
      .populate('show')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Booking history error:', error);

    res.status(500).json({
      message: 'Unable to load your tickets.'
    });
  }
});

// Book specific seats
router.post('/', async (req, res) => {
  let reservedShowId = null;
  let seatLabels = [];

  try {
    const { showId } = req.body;
    seatLabels = req.body.seatLabels;

    // Make sure the user selected 1-8 different seats
    if (
      !Array.isArray(seatLabels) ||
      seatLabels.length < 1 ||
      seatLabels.length > 8 ||
      new Set(seatLabels).size !== seatLabels.length
    ) {
      return res.status(400).json({
        message: 'Choose between 1 and 8 different seats.'
      });
    }

    // Valid seats: A01 to H10
    const validSeat = /^[A-H](0[1-9]|10)$/;

    if (!seatLabels.every(seat => validSeat.test(seat))) {
      return res.status(400).json({
        message: 'One or more seat labels are invalid.'
      });
    }

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        message: 'Performance not found.'
      });
    }

    if (seatLabels.length > show.seatsTotal) {
      return res.status(400).json({
        message: 'Too many seats selected.'
      });
    }

    // Atomically reserve only if none of these seats
    // has already been booked for this performance.
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: show._id,
        bookedSeats: { $nin: seatLabels },
        $expr: {
          $lte: [
            { $add: ['$seatsBooked', seatLabels.length] },
            '$seatsTotal'
          ]
        }
      },
      {
        $addToSet: {
          bookedSeats: { $each: seatLabels }
        },
        $inc: {
          seatsBooked: seatLabels.length
        }
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        message:
          'One or more selected seats are no longer available. Please refresh the seating chart.'
      });
    }

    reservedShowId = show._id;

    // Create the booking.
    // status automatically becomes "confirmed"
    // because of the default in Booking.js.
    const booking = await Booking.create({
      user: req.user.id,
      show: show._id,
      seats: seatLabels.length,
      seatLabels,
      total: show.price * seatLabels.length,
      bookingCode:
        'SS-' + crypto.randomBytes(4).toString('hex').toUpperCase()
    });

    res.status(201).json(await booking.populate('show'));
  } catch (error) {
    // If saving the booking failed after reserving seats,
    // release those seats so they don't remain stuck.
    if (reservedShowId && seatLabels.length) {
      await Show.updateOne(
        { _id: reservedShowId },
        {
          $pull: {
            bookedSeats: { $in: seatLabels }
          },
          $inc: {
            seatsBooked: -seatLabels.length
          }
        }
      ).catch(() => {});
    }

    console.error('Booking error:', error);

    res.status(500).json({
      message: 'Booking failed. Please try again.'
    });
  }
});

// Cancel booking and release its seats
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found.'
      });
    }

    // Don't allow a cancelled booking to be cancelled again.
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        message: 'This booking is already cancelled.'
      });
    }

    // Change the booking status instead of deleting it.
    // This keeps the cancelled booking visible in
    // "My Bookings".
    booking.status = 'cancelled';
    await booking.save();

    // Release the seats so they can be booked again.
    await Show.updateOne(
      { _id: booking.show },
      {
        $pull: {
          bookedSeats: { $in: booking.seatLabels }
        },
        $inc: {
          seatsBooked: -booking.seatLabels.length
        }
      }
    );

    res.json({
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (error) {
    console.error('Cancellation error:', error);

    res.status(500).json({
      message: 'Could not cancel this booking.'
    });
  }
});

export default router;
