"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const validation_1 = require("../middleware/validation");
const passport_1 = __importDefault(require("passport"));
const Post_1 = require("../models/Post");
const mediaService_1 = require("../services/mediaService");
const upload = (0, multer_1.default)({ dest: 'uploads/' });
exports.postRoutes = express_1.default.Router();
exports.postRoutes.post('/', passport_1.default.authenticate('jwt', { session: false }), upload.single('media'), [
    (0, express_validator_1.body)('content').isString().notEmpty().trim(),
    (0, express_validator_1.body)('visibility').isIn(['public', 'private', 'followers']),
    validation_1.validateRequest
], async (req, res) => {
    try {
        let mediaData;
        if (req.file) {
            mediaData = await mediaService_1.mediaService.uploadFile(req.file, 'post');
        }
        const post = new Post_1.Post({
            author: req.user._id,
            content: req.body.content,
            visibility: req.body.visibility,
            media: mediaData
        });
        await post.save();
        res.status(201).json(post);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.postRoutes.get('/user/:userId', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.param)('userId').isMongoId(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const posts = await Post_1.Post.find({
            author: req.params.userId,
            $or: [
                { visibility: 'public' },
                { author: req.user._id },
                { visibility: 'followers' }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePicture')
            .populate('comments.author', 'name profilePicture');
        res.json(posts);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.postRoutes.post('/:postId/like', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.param)('postId').isMongoId(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const post = await Post_1.Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const userLiked = post.likes.includes(req.user._id);
        if (userLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id);
        }
        else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json(post);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.postRoutes.post('/:postId/comments', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.param)('postId').isMongoId(),
    (0, express_validator_1.body)('content').isString().notEmpty().trim(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const post = await Post_1.Post.findById(req.params.postId);
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.postRoutes.delete('/:postId', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.param)('postId').isMongoId(),
    validation_1.validateRequest
], async (req, res) => {
    var _a;
    try {
        const post = await Post_1.Post.findOne({
            _id: req.params.postId,
            author: req.user._id
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
        if ((_a = post.media) === null || _a === void 0 ? void 0 : _a.url) {
            await mediaService_1.mediaService.deleteFile(post.media.url);
        }
        await post.deleteOne();
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
//# sourceMappingURL=post.js.map