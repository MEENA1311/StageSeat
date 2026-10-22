
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },

  seats: {
    type: Number,
    min: 1,
    max: 8,
    required: true
  },

  seatLabels: {
    type: [String],
    required: true
  },

  total: {
    type: Number,
    required: true
  },

  bookingCode: {
    type: String,
    unique: true
  },

  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

// Prevent the same seat from appearing twice
// in one booking.
bookingSchema.pre('validate', function () {
  if (this.seatLabels) {
    this.seats = this.seatLabels.length;
  }
});

export default mongoose.model('Booking', bookingSchema);
