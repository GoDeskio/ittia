"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const validateUser_1 = require("../middleware/validateUser");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.get('/:userId/profile', async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.userId).select('-password -privateKey');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:userId/style-preferences', async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.userId).select('stylePreferences bannerImage');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            stylePreferences: user.stylePreferences,
            bannerImage: user.bannerImage,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/:userId/style-preferences', auth_1.authenticateUser, validateUser_1.validateUserId, async (req, res) => {
    try {
        const user = await User_1.User.findByIdAndUpdate(req.params.userId, { stylePreferences: req.body.stylePreferences }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ stylePreferences: user.stylePreferences });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/:userId/upload-banner', auth_1.authenticateUser, validateUser_1.validateUserId, upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ url: imageUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/:userId/banner', auth_1.authenticateUser, validateUser_1.validateUserId, async (req, res) => {
    try {
        const user = await User_1.User.findByIdAndUpdate(req.params.userId, { bannerImage: req.body.bannerImage }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ bannerImage: user.bannerImage });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map