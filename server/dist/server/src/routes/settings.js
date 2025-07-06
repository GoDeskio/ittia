"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const tokenGenerator_1 = require("../utils/tokenGenerator");
const db_1 = require("../db");
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
router.get('/api-token', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const client = await db_1.pool.connect();
        try {
            const userResult = await client.query('SELECT api_token, first_name, last_name, email FROM users WHERE id = $1', [req.user.id]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            let apiToken = userResult.rows[0].api_token;
            const user = userResult.rows[0];
            const userName = user.first_name && user.last_name ?
                `${user.first_name} ${user.last_name}` :
                user.email.split('@')[0];
            if (!apiToken || apiToken.length < 100) {
                apiToken = (0, tokenGenerator_1.generateApiToken)();
                await client.query('UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [apiToken, req.user.id]);
            }
            const qrData = {
                type: 'voicevault_library_access',
                version: '2.0',
                userId: req.user.id,
                userName: userName,
                userEmail: user.email,
                apiToken: apiToken,
                accessUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/${req.user.id}`,
                timestamp: new Date().toISOString(),
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            const qrDataString = encodeURIComponent(JSON.stringify(qrData));
            const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${qrDataString}&color=1976d2&bgcolor=ffffff&ecc=H&margin=2`;
            const audioFilesResult = await client.query('SELECT COUNT(*) as file_count FROM audio_files WHERE user_id = $1', [req.user.id]);
            const fileCount = parseInt(((_a = audioFilesResult.rows[0]) === null || _a === void 0 ? void 0 : _a.file_count) || '0');
            res.json({
                apiToken,
                qrCode,
                tokenLength: apiToken.length,
                userName,
                userEmail: user.email,
                publicUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/${req.user.id}`,
                stats: {
                    audioFiles: fileCount
                }
            });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching API token:', error);
        res.status(500).json({ error: 'Error fetching API token' });
    }
});
router.post('/api-token/regenerate', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const newToken = (0, tokenGenerator_1.generateApiToken)();
        const client = await db_1.pool.connect();
        try {
            await client.query('UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newToken, req.user.id]);
            const userResult = await client.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [req.user.id]);
            const user = userResult.rows[0];
            const userName = user.first_name && user.last_name ?
                `${user.first_name} ${user.last_name}` :
                user.email.split('@')[0];
            const qrData = {
                type: 'voicevault_library_access',
                version: '2.0',
                userId: req.user.id,
                userName: userName,
                userEmail: user.email,
                apiToken: newToken,
                accessUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/${req.user.id}`,
                timestamp: new Date().toISOString(),
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            const qrDataString = encodeURIComponent(JSON.stringify(qrData));
            const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${qrDataString}&color=1976d2&bgcolor=ffffff&ecc=H&margin=2`;
            res.json({
                apiToken: newToken,
                qrCode,
                tokenLength: newToken.length,
                message: 'API token regenerated successfully'
            });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error regenerating API token:', error);
        res.status(500).json({ error: 'Error regenerating API token' });
    }
});
router.get('/validate-token/:token', async (req, res) => {
    var _a;
    try {
        const { token } = req.params;
        const client = await db_1.pool.connect();
        try {
            const result = await client.query('SELECT id, first_name, last_name, email FROM users WHERE api_token = $1', [token]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid API token' });
            }
            const user = result.rows[0];
            const userName = user.first_name && user.last_name ?
                `${user.first_name} ${user.last_name}` :
                user.email.split('@')[0];
            const audioFilesResult = await client.query('SELECT COUNT(*) as file_count FROM audio_files WHERE user_id = $1', [user.id]);
            const fileCount = parseInt(((_a = audioFilesResult.rows[0]) === null || _a === void 0 ? void 0 : _a.file_count) || '0');
            res.json({
                valid: true,
                user: {
                    id: user.id,
                    name: userName,
                    email: user.email
                },
                stats: {
                    audioFiles: fileCount
                }
            });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error validating token:', error);
        res.status(500).json({ error: 'Error validating token' });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map