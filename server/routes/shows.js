
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

router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        message: 'Performance not found.'
      });
    }

    res.json(show);
  } catch (error) {
    console.error('SHOW BY ID API ERROR:', error);

    res.status(400).json({
      message: 'Invalid performance ID.',
      error: error.message
    });
  }
});

export default router;
