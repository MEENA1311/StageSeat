
import mongoose from 'mongoose';

const showSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  genre: String,
  date: { type: Date, required: true },
  time: String,
  venue: String,
  city: String,
  price: { type: Number, required: true },
  duration: String,
  language: String,
  description: String,
  image: String,
  rating: Number,
  featured: Boolean,

  seatsTotal: { type: Number, default: 80 },
  seatsBooked: { type: Number, default: 0 },

  // Exact seats booked for this performance
  bookedSeats: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Show', showSchema);
