"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioRoutes = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const AudioFile_1 = require("../models/AudioFile");
const CachedAudio_1 = require("../models/CachedAudio");
const User_1 = require("../models/User");
const audioProcessor_1 = require("../services/audioProcessor");
const router = express_1.default.Router();
exports.audioRoutes = router;
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        var _a;
        const authReq = req;
        if (!((_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id)) {
            cb(new Error('User not authenticated'), '');
            return;
        }
        const uploadDir = path_1.default.join(__dirname, '../../uploads', authReq.user.id, file.fieldname === 'cache' ? 'cache' : 'library');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = (0, uuid_1.v4)();
        cb(null, `${uniqueId}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'audio/wav') {
            cb(new Error('Only .wav files are allowed'));
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});
router.get('/cache', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const authReq = req;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const cachedFiles = await CachedAudio_1.CachedAudio.findByUserId(userId, false);
        res.json(cachedFiles);
    }
    catch (error) {
        console.error('Error fetching cached files:', error);
        res.status(500).json({ error: 'Error fetching cached files' });
    }
});
router.post('/upload', auth_1.authenticateToken, upload.single('audio'), async (req, res) => {
    var _a;
    try {
        const authReq = req;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || !req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const totalSize = await AudioFile_1.AudioFile.getTotalSize(userId);
        if (totalSize + req.file.size > user.storage_quota.library) {
            fs_1.default.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Storage quota exceeded' });
        }
        const audioFile = await AudioFile_1.AudioFile.create({
            user_id: userId,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            duration: 0,
            metadata: {
                originalName: req.file.originalname,
                mimeType: req.file.mimetype
            }
        });
        await User_1.User.updateStorageUsage(userId, 'library', req.file.size);
        res.json(audioFile);
    }
    catch (error) {
        console.error('Error uploading audio file:', error);
        res.status(500).json({ error: 'Error uploading audio file' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const authReq = req;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        const fileId = req.params.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const audioFile = await AudioFile_1.AudioFile.findById(fileId);
        if (!audioFile || audioFile.user_id !== userId) {
            return res.status(404).json({ error: 'Audio file not found' });
        }
        fs_1.default.unlinkSync(audioFile.path);
        await AudioFile_1.AudioFile.delete(fileId);
        await User_1.User.updateStorageUsage(userId, 'library', -audioFile.size);
        res.json({ message: 'Audio file deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting audio file:', error);
        res.status(500).json({ error: 'Error deleting audio file' });
    }
});
router.post('/process/:id', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const cachedFile = await CachedAudio_1.CachedAudio.findOne({ _id: req.params.id, userId });
        if (!cachedFile) {
            return res.status(404).json({ error: 'Cached file not found' });
        }
        const wordFiles = await (0, audioProcessor_1.processAudioToWords)(cachedFile.path, userId, cachedFile.apiToken);
        const audioFiles = await Promise.all(wordFiles.map(async (wordFile) => {
            const audioFile = new AudioFile_1.AudioFile({
                userId,
                filename: wordFile.filename,
                path: wordFile.path,
                size: wordFile.size,
                duration: wordFile.duration,
                url: `/api/audio/stream/library/${path_1.default.basename(wordFile.path)}`,
            });
            await audioFile.save();
            return audioFile;
        }));
        cachedFile.processed = true;
        await cachedFile.save();
        res.json(audioFiles);
    }
    catch (error) {
        console.error('Error processing audio file:', error);
        res.status(500).json({ error: 'Error processing audio file' });
    }
});
router.post('/cache/:id/mark-processed', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const cachedAudio = await CachedAudio_1.CachedAudio.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!cachedAudio) {
            return res.status(404).json({ error: 'Cached audio not found' });
        }
        cachedAudio.processed = true;
        await cachedAudio.save();
        res.json({ message: 'Audio marked as processed', audio: cachedAudio });
    }
    catch (error) {
        console.error('Error marking audio as processed:', error);
        res.status(500).json({ error: 'Error marking audio as processed' });
    }
});
router.delete('/cache/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const cachedAudio = await CachedAudio_1.CachedAudio.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!cachedAudio) {
            return res.status(404).json({ error: 'Cached audio not found' });
        }
        const filePath = path_1.default.join(__dirname, '..', '..', 'uploads', req.user.id, 'cache', cachedAudio.filename);
        try {
            await fs_1.default.unlink(filePath);
        }
        catch (err) {
            console.error('Error deleting file:', err);
        }
        await CachedAudio_1.CachedAudio.deleteOne({ _id: req.params.id });
        const user = await User_1.User.findById(req.user.id);
        if (user) {
            user.storageUsed.cache -= cachedAudio.size;
            if (user.storageUsed.cache < 0)
                user.storageUsed.cache = 0;
            await user.save();
        }
        res.json({ message: 'Cached audio deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting cached audio:', error);
        res.status(500).json({ error: 'Error deleting cached audio' });
    }
});
router.get('/library', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const audioFiles = await AudioFile_1.AudioFile.find({ userId }).sort({ createdAt: -1 });
        res.json(audioFiles);
    }
    catch (error) {
        console.error('Error fetching audio files:', error);
        res.status(500).json({ error: 'Error fetching audio files' });
    }
});
router.get('/stream/:type/:filename', auth_1.authenticateToken, (req, res) => {
    var _a;
    try {
        const { type, filename } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const filePath = path_1.default.join(__dirname, '../../uploads', userId, type, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        const stat = fs_1.default.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs_1.default.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/wav',
            };
            res.writeHead(206, head);
            file.pipe(res);
        }
        else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/wav',
            };
            res.writeHead(200, head);
            fs_1.default.createReadStream(filePath).pipe(res);
        }
    }
    catch (error) {
        console.error('Error streaming audio file:', error);
        res.status(500).json({ error: 'Error streaming audio file' });
    }
});
//# sourceMappingURL=audio.js.map