// routes/metaRoutes.js
import express from 'express';
import { getJobCategories } from '../controllers/metaController.js';

const router = express.Router();

router.get('/job-categories', getJobCategories);

export default router;
