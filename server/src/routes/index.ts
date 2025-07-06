import express from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import postRoutes from './posts';
import settingsRoutes from './settings';
import versionRoutes from './version';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/settings', settingsRoutes);
router.use('/version', versionRoutes);

export default router; 