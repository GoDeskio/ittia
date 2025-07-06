"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const processor_1 = require("../models/emotion/processor");
const express_2 = __importDefault(require("express"));
const auth_2 = require("../middleware/auth");
const db_1 = require("../db");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.wav', '.mp3'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only WAV and MP3 files are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
router.post('/upload', auth_1.auth, upload.single('voice'), async (req, res, next) => {
    try {
        if (!req.file) {
            const error = new Error('No file uploaded');
            error.statusCode = 400;
            throw error;
        }
        const result = await (0, processor_1.processVoiceEmotion)(req.file.path);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/history', auth_1.auth, async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: []
        });
    }
    catch (error) {
        next(error);
    }
});
const librariesRouter = express_2.default.Router();
librariesRouter.get('/libraries', auth_2.authenticateToken, async (req, res) => {
    try {
        const result = await db_1.pool.query(`SELECT id, name, owner, is_public, created_at 
       FROM voice_libraries 
       WHERE owner = $1 OR is_public = true`, [req.user.id]);
        res.json({ libraries: result.rows });
    }
    catch (error) {
        console.error('Error fetching libraries:', error);
        res.status(500).json({ error: 'Failed to fetch libraries' });
    }
});
librariesRouter.post('/libraries', auth_2.authenticateToken, async (req, res) => {
    const { name, apiKey, token } = req.body;
    try {
        const result = await db_1.pool.query(`INSERT INTO voice_libraries (name, owner, api_key, token, is_public)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, name, owner, is_public, created_at`, [name, req.user.id, apiKey, token]);
        res.status(201).json({ library: result.rows[0] });
    }
    catch (error) {
        console.error('Error adding library:', error);
        res.status(500).json({ error: 'Failed to add library' });
    }
});
librariesRouter.delete('/libraries/:id', auth_2.authenticateToken, async (req, res) => {
    try {
        const result = await db_1.pool.query(`DELETE FROM voice_libraries 
       WHERE id = $1 AND owner = $2
       RETURNING id`, [req.params.id, req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Library not found or unauthorized' });
        }
        res.json({ message: 'Library deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting library:', error);
        res.status(500).json({ error: 'Failed to delete library' });
    }
});
librariesRouter.put('/libraries/:id', auth_2.authenticateToken, async (req, res) => {
    const { name, apiKey, token, isPublic } = req.body;
    try {
        const result = await db_1.pool.query(`UPDATE voice_libraries 
       SET name = COALESCE($1, name),
           api_key = COALESCE($2, api_key),
           token = COALESCE($3, token),
           is_public = COALESCE($4, is_public)
       WHERE id = $5 AND owner = $6
       RETURNING id, name, owner, is_public, created_at`, [name, apiKey, token, isPublic, req.params.id, req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Library not found or unauthorized' });
        }
        res.json({ library: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating library:', error);
        res.status(500).json({ error: 'Failed to update library' });
    }
});
librariesRouter.get('/libraries/:id', auth_2.authenticateToken, async (req, res) => {
    try {
        const result = await db_1.pool.query(`SELECT id, name, owner, is_public, created_at 
       FROM voice_libraries 
       WHERE id = $1 AND (owner = $2 OR is_public = true)`, [req.params.id, req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Library not found or unauthorized' });
        }
        res.json({ library: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching library:', error);
        res.status(500).json({ error: 'Failed to fetch library' });
    }
});
exports.voiceRoutes = router;
exports.default = librariesRouter;
//# sourceMappingURL=voice.js.map