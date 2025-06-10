import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { errorLoggingService, errorScreenshotUpload } from '../services/errorLogging.service';
import passport from 'passport';
import { isAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Submit error report with screenshots
router.post(
  '/report',
  errorScreenshotUpload.array('screenshots', 10),
  [
    body('errorType').isString().notEmpty(),
    body('description').isString().notEmpty(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const errorData = {
        userId: (req.user as any)?._id,
        errorType: req.body.errorType,
        description: req.body.description,
        userAgent: req.headers['user-agent'] || '',
        route: req.body.route || req.headers.referer || '',
        stackTrace: req.body.stackTrace,
        screenshots: req.files as Express.Multer.File[] || []
      };

      const errorLog = await errorLoggingService.logError(errorData);
      res.status(201).json(errorLog);
    } catch (error) {
      console.error('Error submitting error report:', error);
      res.status(500).json({ message: 'Failed to submit error report' });
    }
  }
);

// Get error logs (admin only)
router.get(
  '/logs',
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        userId: req.query.userId as string,
        errorType: req.query.errorType as string
      };

      const logs = await errorLoggingService.getErrorLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      res.status(500).json({ message: 'Failed to fetch error logs' });
    }
  }
);

// Update error log status (admin only)
router.patch(
  '/logs/:errorId',
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  [
    body('status').isIn(['new', 'in-progress', 'resolved']),
    body('resolution').optional().isString(),
    body('assignedTo').optional().isString(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { errorId } = req.params;
      const update = {
        status: req.body.status,
        resolution: req.body.resolution,
        assignedTo: req.body.assignedTo
      };

      const updatedLog = await errorLoggingService.updateErrorStatus(errorId, update);
      if (!updatedLog) {
        return res.status(404).json({ message: 'Error log not found' });
      }

      res.json(updatedLog);
    } catch (error) {
      console.error('Error updating error log:', error);
      res.status(500).json({ message: 'Failed to update error log' });
    }
  }
);

export default router; 