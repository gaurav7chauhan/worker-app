import { Router } from 'express';
import {
  deleteRating,
  listUserRatings,
  myGivenRatings,
  setRating,
} from '../singleImport.js';

const router = Router();

router.post('/add', setRating);
router.get('/given', myGivenRatings);
router.get('/', listUserRatings);
router.delete('/:ratingId', deleteRating);

export default router;
