import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express/AuthenticatedRequest';

export const validateUserId = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if the authenticated user is trying to modify their own data
  if (req.user?._id.toString() !== req.params.userId) {
    return res.status(403).json({ message: 'Not authorized to modify this user\'s data' });
  }
  next();
}; 