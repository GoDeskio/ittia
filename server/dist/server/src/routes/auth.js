"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const passport_1 = __importDefault(require("passport"));
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const authService = new authService_1.AuthService();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/pin', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('pinCode').isString().isLength({ min: 4, max: 4 }),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const { email, pinCode } = req.body;
        const result = await authService.loginWithPinCode(email, pinCode);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid PIN code' });
    }
});
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), async (req, res) => {
    try {
        const result = await authService.loginWithGoogle(req.user);
        res.redirect(`/auth-callback?token=${result.token}`);
    }
    catch (error) {
        res.redirect('/auth-callback?error=google_auth_failed');
    }
});
router.get('/facebook', passport_1.default.authenticate('facebook', {
    scope: ['email', 'public_profile']
}));
router.get('/facebook/callback', passport_1.default.authenticate('facebook', { session: false }), async (req, res) => {
    try {
        const result = await authService.loginWithFacebook(req.user);
        res.redirect(`/auth-callback?token=${result.token}`);
    }
    catch (error) {
        res.redirect('/auth-callback?error=facebook_auth_failed');
    }
});
router.get('/linkedin', passport_1.default.authenticate('linkedin', {
    scope: ['r_emailaddress', 'r_liteprofile']
}));
router.get('/linkedin/callback', passport_1.default.authenticate('linkedin', { session: false }), async (req, res) => {
    try {
        const result = await authService.loginWithLinkedIn(req.user);
        res.redirect(`/auth-callback?token=${result.token}`);
    }
    catch (error) {
        res.redirect('/auth-callback?error=linkedin_auth_failed');
    }
});
router.get('/instagram', passport_1.default.authenticate('instagram', {
    scope: ['basic']
}));
router.get('/instagram/callback', passport_1.default.authenticate('instagram', { session: false }), async (req, res) => {
    try {
        const result = await authService.loginWithInstagram(req.user);
        res.redirect(`/auth-callback?token=${result.token}`);
    }
    catch (error) {
        res.redirect('/auth-callback?error=instagram_auth_failed');
    }
});
router.post('/fingerprint', [
    (0, express_validator_1.body)('userId').isString().notEmpty(),
    (0, express_validator_1.body)('fingerprintHash').isString().notEmpty(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const { userId, fingerprintHash } = req.body;
        const isValid = await authService.verifyFingerprint(userId, fingerprintHash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid fingerprint' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const token = await authService.generateToken(user);
        res.json({ token, user });
    }
    catch (error) {
        res.status(500).json({ message: 'Fingerprint verification failed' });
    }
});
router.get('/me', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id).select('-password -pinCode -fingerPrintHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch user data' });
    }
});
router.post('/logout', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    res.json({ message: 'Logged out successfully' });
});
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const user = new User_1.User({
            name,
            email,
            password
        });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map