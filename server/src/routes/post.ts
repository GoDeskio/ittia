import express, { Response } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { validateRequest } from '../middleware/validation';
import passport from 'passport';
import { Post } from '../models/Post';
import { mediaService } from '../services/mediaService';
import { AuthenticatedRequest } from '../types/express/AuthenticatedRequest';

const upload = multer({ dest: 'uploads/' });

export const postRoutes = express.Router();

// Create a new post
postRoutes.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.single('media'),
  [
    body('content').isString().notEmpty().trim(),
    body('visibility').isIn(['public', 'private', 'followers']),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      let mediaData;
      if (req.file) {
        mediaData = await mediaService.uploadFile(req.file, 'post');
      }

      const post = new Post({
        author: req.user._id,
        content: req.body.content,
        visibility: req.body.visibility,
        media: mediaData
      });

      await post.save();
      res.status(201).json(post);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Get user's posts
postRoutes.get(
  '/user/:userId',
  passport.authenticate('jwt', { session: false }),
  [
    param('userId').isMongoId(),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const posts = await Post.find({
        author: req.params.userId,
        $or: [
          { visibility: 'public' },
          { author: req.user._id },
          { visibility: 'followers' } // TODO: Add follower check
        ]
      })
        .sort({ createdAt: -1 })
        .populate('author', 'name profilePicture')
        .populate('comments.author', 'name profilePicture');

      res.json(posts);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Like/Unlike a post
postRoutes.post(
  '/:postId/like',
  passport.authenticate('jwt', { session: false }),
  [
    param('postId').isMongoId(),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const userLiked = post.likes.includes(req.user._id);
      if (userLiked) {
        post.likes = post.likes.filter(id => id.toString() !== req.user._id);
      } else {
        post.likes.push(req.user._id);
      }

      await post.save();
      res.json(post);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Add a comment
postRoutes.post(
  '/:postId/comments',
  passport.authenticate('jwt', { session: false }),
  [
    param('postId').isMongoId(),
    body('content').isString().notEmpty().trim(),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.comments.push({
        author: req.user._id,
        content: req.body.content,
        createdAt: new Date()
      });

      await post.save();
      res.status(201).json(post);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Delete a post
postRoutes.delete(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  [
    param('postId').isMongoId(),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const post = await Post.findOne({
        _id: req.params.postId,
        author: req.user._id
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found or unauthorized' });
      }

      if (post.media?.url) {
        await mediaService.deleteFile(post.media.url);
      }

      await post.deleteOne();
      res.json({ message: 'Post deleted successfully' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
); 