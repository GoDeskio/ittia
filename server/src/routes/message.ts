import express, { Response } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import passport from 'passport';
import { messageService } from '../services/messageService';
import { AuthenticatedRequest } from '../types/express/AuthenticatedRequest';

export const messageRoutes = express.Router();

// Send a message
messageRoutes.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  [
    body('recipientId').isMongoId(),
    body('content').isString().notEmpty().trim(),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const message = await messageService.sendMessage(
        req.user._id,
        req.body.recipientId,
        req.body.content
      );
      res.status(201).json(message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Get conversation with another user
messageRoutes.get(
  '/conversation/:userId',
  passport.authenticate('jwt', { session: false }),
  [
    param('userId').isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const conversation = await messageService.getConversation(
        req.user._id,
        req.params.userId,
        page,
        limit
      );
      res.json(conversation);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Get recent conversations
messageRoutes.get(
  '/recent',
  passport.authenticate('jwt', { session: false }),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const conversations = await messageService.getRecentConversations(req.user._id);
      res.json(conversations);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Mark messages as read
messageRoutes.post(
  '/mark-read',
  passport.authenticate('jwt', { session: false }),
  [
    body('messageIds').isArray(),
    body('messageIds.*').isMongoId(),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await messageService.markAsRead(req.body.messageIds, req.user._id);
      res.json({ message: 'Messages marked as read' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Delete a message
messageRoutes.delete(
  '/:messageId',
  passport.authenticate('jwt', { session: false }),
  [
    param('messageId').isMongoId(),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await messageService.deleteMessage(req.params.messageId, req.user._id);
      res.json({ message: 'Message deleted' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Update message retention period
messageRoutes.post(
  '/retention',
  passport.authenticate('jwt', { session: false }),
  [
    body('retentionPeriod').isIn(['1h', '6h', '24h', '7d', '30d']),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await messageService.updateMessageRetention(
        req.user._id,
        req.body.retentionPeriod
      );
      res.json({ message: 'Message retention period updated successfully' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
); 