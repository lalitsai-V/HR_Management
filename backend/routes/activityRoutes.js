import express from 'express';
import { getActivityLogs } from '../controllers/activityController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getActivityLogs);

export default router;
