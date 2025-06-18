"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const post_1 = require("../models/post");
const permissions_1 = require("../middleware/permissions");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
router.post('/', auth_1.authenticateUser, permissions_1.checkMobilePermissions, upload.array('media', 5), async (req, res) => {
    try {
        const files = req.files;
        const mediaUrls = files ? files.map(file => `/uploads/${file.filename}`) : [];
        const mediaTypes = files ? files.map(file => {
            if (file.mimetype.startsWith('image/'))
                return 'image';
            if (file.mimetype.startsWith('video/'))
                return 'video';
            if (file.mimetype.startsWith('audio/'))
                return 'audio';
            return 'file';
        }) : [];
        const post = new post_1.Post({
            author: req.user._id,
            content: req.body.content,
            mediaUrls,
            mediaTypes,
            visibility: req.body.visibility || 'public'
        });
        await post.save();
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
});
router.get('/feed', auth_1.authenticateUser, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const posts = await post_1.Post.find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'name profilePicture')
            .populate('comments.author', 'name profilePicture');
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching feed' });
    }
});
router.post('/:postId/like', auth_1.authenticateUser, async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const userLiked = post.likes.includes(req.user._id);
        if (userLiked) {
            post.likes = post.likes.filter(id => !id.equals(req.user._id));
        }
        else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json({ likes: post.likes.length, userLiked: !userLiked });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating like' });
    }
});
router.post('/:postId/comments', auth_1.authenticateUser, async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.postId);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error adding comment' });
    }
});
router.post('/:postId/share', auth_1.authenticateUser, async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        post.shares += 1;
        await post.save();
        res.json({ shares: post.shares });
    }
    catch (error) {
        res.status(500).json({ error: 'Error sharing post' });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map