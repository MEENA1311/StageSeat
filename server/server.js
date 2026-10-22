import dotenv from 'dotenv';
import mongoose from 'mongoose';

import app from './app.js';
import Show from './models/Show.js';

dotenv.config();

const port = process.env.PORT || 5000;

const seed = async () => {
  if (await Show.countDocuments()) return;

  const base = Date.now();

  const data = [
    [
      'The Last Monsoon',
      'Blue Mango Theatre',
      'Drama',
      2,
      'Rangashankara',
      'Bengaluru',
      499,
      '2h 10m',
      'Kannada',
      'A tender, beautifully observed story of a family returning to the coast just before the first monsoon rain.',
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
      4.8,
      true,
    ],
    [
      'A Midsummer Night’s Dream',
      'The Madras Players',
      'Comedy',
      4,
      'Museum Theatre',
      'Chennai',
      650,
      '2h 20m',
      'English',
      'Shakespeare’s sparkling romantic comedy reimagined with live music, mischief and a little theatrical magic.',
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=85',
      4.9,
      true,
    ],
    [
      'The Blue Umbrella',
      'Little Lantern Company',
      'Family',
      6,
      'Alliance Française',
      'Chennai',
      350,
      '1h 30m',
      'Tamil / English',
      'A heartwarming family production about kindness, jealousy and the small things that make a community.',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85',
      4.7,
      false,
    ],
    [
      'The House of Bernarda Alba',
      'StageCraft Collective',
      'Drama',
      8,
      'Jagriti Theatre',
      'Bengaluru',
      550,
      '1h 50m',
      'English',
      'A gripping, atmospheric production exploring freedom, family and the cost of silence.',
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=85',
      4.6,
      false,
    ],
    [
      'Laughing Matters',
      'Chennai Comedy Lab',
      'Comedy',
      10,
      'Medai - The Stage',
      'Chennai',
      299,
      '1h 15m',
      'Tamil / English',
      'A quick-witted ensemble comedy packed with relatable characters and laugh-out-loud moments.',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85',
      4.5,
      true,
    ],
    [
      'Voices from the River',
      'Namma Theatre',
      'Musical',
      12,
      'Rangashankara',
      'Bengaluru',
      450,
      '1h 45m',
      'Kannada',
      'Live percussion, movement and powerful storytelling meet in an original musical inspired by river life.',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85',
      4.8,
      false,
    ],
    [
      'The Curious Case',
      'Theatre Nisha',
      'Mystery',
      14,
      'Museum Theatre',
      'Chennai',
      399,
      '1h 40m',
      'English',
      'An intimate whodunit where every clue changes the story and the audience is part of the mystery.',
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
      4.6,
      false,
    ],
    [
      'Once Upon a Stage',
      'Little Lantern Company',
      'Family',
      16,
      'Jagriti Theatre',
      'Bengaluru',
      325,
      '1h 20m',
      'English',
      'A playful, colourful adventure for young theatre lovers and the young at heart.',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85',
      4.7,
      false,
    ],
  ];

  await Show.insertMany(
    data.map((d) => ({
      title: d[0],
      company: d[1],
      genre: d[2],
      date: new Date(base + (d[3] + 1) * 86400000),
      time: '7:00 PM',
      venue: d[4],
      city: d[5],
      price: d[6],
      duration: d[7],
      language: d[8],
      description: d[9],
      image: d[10],
      rating: d[11],
      featured: d[12],
      seatsTotal: 80,
      seatsBooked: Math.floor(Math.random() * 18),
    }))
  );

  console.log('Sample performances added.');
};

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing. Check server/.env');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Atlas connected successfully');

    await seed();

    app.listen(port, () => {
      console.log(`StageSeat API running on ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });