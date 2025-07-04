"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.get('/storage-path', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            libraryPath: ((_a = user.settings) === null || _a === void 0 ? void 0 : _a.libraryPath) || ''
        });
    }
    catch (error) {
        console.error('Error fetching storage path settings:', error);
        res.status(500).json({ error: 'Error fetching storage path settings' });
    }
});
router.post('/storage-path', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { libraryPath } = req.body;
        if (!user.settings) {
            user.settings = {};
        }
        user.settings.libraryPath = libraryPath;
        await user.save();
        res.json({
            message: 'Storage path settings updated successfully',
            libraryPath: user.settings.libraryPath
        });
    }
    catch (error) {
        console.error('Error updating storage path settings:', error);
        res.status(500).json({ error: 'Error updating storage path settings' });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map