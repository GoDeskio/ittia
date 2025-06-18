"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const passport_1 = __importDefault(require("passport"));
const validation_1 = require("../middleware/validation");
const multer_1 = __importDefault(require("multer"));
const mediaService_1 = require("../services/mediaService");
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = express_1.default.Router();
router.get('/profile', auth_1.authenticateUser, async (req, res, next) => {
    var _a;
    try {
        const user = await User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});
router.put('/profile', auth_1.authenticateUser, async (req, res, next) => {
    var _a;
    try {
        const updates = {
            name: req.body.name,
            profilePicture: req.body.profilePicture,
            bannerImage: req.body.bannerImage,
            title: req.body.title,
            bio: req.body.bio
        };
        const user = await User_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, updates);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});
router.post('/upload', passport_1.default.authenticate('jwt', { session: false }), upload.single('file'), (req, res, next) => {
    if (!['profile', 'banner'].includes(req.body.type)) {
        return res.status(400).json({ message: 'Invalid type' });
    }
    next();
}, validation_1.validateRequest, async (req, res, next) => {
    var _a;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const mediaData = await mediaService_1.mediaService.uploadFile(req.file, req.body.type);
        const updateField = req.body.type === 'profile' ? 'profilePicture' : 'bannerImage';
        const updates = {};
        updates[updateField] = mediaData.url;
        await User_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, updates);
        return res.json(mediaData);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(400).json({ message: errorMessage });
    }
});
router.post('/change-password', auth_1.authenticateToken, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const validPassword = await User_1.User.comparePassword(user, currentPassword);
        if (!validPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        await User_1.User.findByIdAndUpdate(user._id, { password: await bcryptjs_1.default.hash(newPassword, 10) });
        return res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ error: 'Error updating password' });
    }
});
router.post('/storage-quota', auth_1.authenticateToken, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { cache, library } = req.body;
        if (cache && cache < user.storageUsed.cache) {
            return res.status(400).json({
                error: 'New cache quota must be greater than current usage',
                currentUsage: user.storageUsed.cache
            });
        }
        if (library && library < user.storageUsed.library) {
            return res.status(400).json({
                error: 'New library quota must be greater than current usage',
                currentUsage: user.storageUsed.library
            });
        }
        if (cache)
            await User_1.User.updateStorageQuota(user._id, 'cache', cache);
        if (library)
            await User_1.User.updateStorageQuota(user._id, 'library', library);
        const updatedUser = await User_1.User.findById(user._id);
        return res.json({
            message: 'Storage quota updated successfully',
            storageQuota: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.storageQuota,
            storageUsed: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.storageUsed
        });
    }
    catch (error) {
        console.error('Error updating storage quota:', error);
        return res.status(500).json({ error: 'Error updating storage quota' });
    }
});
router.get('/storage-usage', auth_1.authenticateToken, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({
            quota: user.storageQuota,
            used: user.storageUsed,
            available: {
                cache: user.storageQuota.cache - user.storageUsed.cache,
                library: user.storageQuota.library - user.storageUsed.library
            }
        });
    }
    catch (error) {
        console.error('Error fetching storage usage:', error);
        return res.status(500).json({ error: 'Error fetching storage usage' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map