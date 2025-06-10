import express from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import postRoutes from './posts';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

export default router; 