
import { Router } from 'express';
import Show from '../models/Show.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await Show.db.asPromise();

    const database = Show.db.name;
    const collection = Show.collection.name;

    const collections = await Show.db.db
      .listCollections()
      .toArray();

    const count = await Show.countDocuments({});

    console.log('DATABASE:', database);
    console.log('COLLECTION:', collection);
    console.log('AVAILABLE COLLECTIONS:', collections.map(c => c.name));
    console.log('SHOW COUNT:', count);

    res.json({
      database,
      collection,
      availableCollections: collections.map(c => c.name),
      count,
      shows: await Show.find({})
    });
  } catch (error) {
    console.error('SHOW DIAGNOSTIC ERROR:', error);

    res.status(500).json({
      message: 'Database diagnostic failed.',
      error: error.message
    });
  }
});

export default router;
