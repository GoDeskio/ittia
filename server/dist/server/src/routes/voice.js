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
exports.voiceRoutes = router;
//# sourceMappingURL=voice.js.map