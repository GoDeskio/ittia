import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateUser } from '../middleware/auth';
import { Post } from '../models/post';
import { checkMobilePermissions } from '../middleware/permissions';

const router = express.Router();

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Create a new post with media
router.post('/', authenticateUser, checkMobilePermissions, upload.array('media', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const mediaUrls = files ? files.map(file => `/uploads/${file.filename}`) : [];
    const mediaTypes = files ? files.map(file => {
      if (file.mimetype.startsWith('image/')) return 'image';
      if (file.mimetype.startsWith('video/')) return 'video';
      if (file.mimetype.startsWith('audio/')) return 'audio';
      return 'file';
    }) : [];

    const post = new Post({
      author: req.user._id,
      content: req.body.content,
      mediaUrls,
      mediaTypes,
      visibility: req.body.visibility || 'public'
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Get posts for feed
router.get('/feed', authenticateUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const posts = await Post.find({ visibility: 'public' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feed' });
  }
});

// Like/unlike a post
router.post('/:postId/like', authenticateUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userLiked = post.likes.includes(req.user._id);
    if (userLiked) {
      post.likes = post.likes.filter(id => !id.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: post.likes.length, userLiked: !userLiked });
  } catch (error) {
    res.status(500).json({ error: 'Error updating like' });
  }
});

// Add a comment
router.post('/:postId/comments', authenticateUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      content: req.body.content,
      createdAt: new Date()
    });

    await post.save();
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Share a post
router.post('/:postId/share', authenticateUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.shares += 1;
    await post.save();
    res.json({ shares: post.shares });
  } catch (error) {
    res.status(500).json({ error: 'Error sharing post' });
  }
});

export default router; 