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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const qrcode_1 = __importDefault(require("qrcode"));
const tokenGenerator_1 = require("../utils/tokenGenerator");
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
    const { email, password, name } = req.body;
    try {
        const userCheck = await db_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const apiToken = (0, tokenGenerator_1.generateApiToken)();
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const client = await db_1.pool.connect();
        try {
            await client.query('BEGIN');
            const userResult = await client.query(`INSERT INTO users (email, password, name, api_token)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, api_token`, [email, hashedPassword, name, apiToken]);
            const user = userResult.rows[0];
            const libraryResult = await client.query(`INSERT INTO voice_libraries (name, owner, api_key, token, is_public)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, api_key, token`, [`${name}'s Voice Library`, user.id, apiToken, apiToken]);
            const library = libraryResult.rows[0];
            const qrCodeData = {
                type: 'voicevault_library',
                libraryId: library.id,
                apiToken: apiToken,
                owner: name,
                timestamp: new Date().toISOString()
            };
            const qrCode = await qrcode_1.default.toDataURL(JSON.stringify(qrCodeData), {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 400
            });
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            await client.query('COMMIT');
            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token,
                library: {
                    id: library.id,
                    name: library.name,
                    apiToken: library.api_key
                },
                qrCode
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map