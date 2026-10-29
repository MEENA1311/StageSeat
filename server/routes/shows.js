
import { Router } from 'express';
import Show from '../models/Show.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, genre, city } = req.query;

    const filter = {
      date: {
        $gte: new Date(Date.now() - 86400000)
      }
    };

    if (genre && genre !== 'All') {
      filter.genre = genre;
    }

    if (city) {
      filter.city = new RegExp(city, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { venue: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    const shows = await Show.find(filter).sort({
      featured: -1,
      date: 1
    });

    res.json(shows);
  } catch (error) {
    console.error('SHOWS API ERROR:', error);

    res.status(500).json({
      message: 'Unable to load performances.',
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = Show.db;

    const databaseName = db.name;
    const collectionName = Show.collection.name;
    const count = await Show.countDocuments({});

    console.log({
      databaseName,
      collectionName,
      count
    });

    res.json({
      databaseName,
      collectionName,
      count,
      shows: await Show.find({})
    });
  } catch (error) {
    console.error('SHOWS DIAGNOSTIC ERROR:', error);

    res.status(500).json({
      message: error.message
    });
  }
});

export default router;
