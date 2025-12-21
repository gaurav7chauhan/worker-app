import { Router } from 'express';
import {
  deleteRating,
  jwtVerify,
  listUserRatings,
  myGivenRatings,
  requireActiveUser,
  setRating,
} from '../singleImport.js';

const router = Router();

// protected routes
router.post('/add', jwtVerify, requireActiveUser, setRating);
router.get('/given', jwtVerify, requireActiveUser, myGivenRatings);
router.get('/', jwtVerify, requireActiveUser, listUserRatings);
router.delete('/:ratingId', jwtVerify, requireActiveUser, deleteRating);

export default router;
