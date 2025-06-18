"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emotionRoutes = void 0;
const express_1 = require("express");
const analysis_1 = require("../models/emotion/analysis");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const emotionService_1 = require("../services/emotionService");
const qrcode_1 = require("../utils/qrcode");
const location_1 = require("../utils/location");
const router = (0, express_1.Router)();
exports.emotionRoutes = router;
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const analyses = await analysis_1.EmotionAnalysisModel.find({ userId: authReq.user.id });
        res.json(analyses);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, upload_1.uploadAudio, async (req, res, next) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }
        const location = await (0, location_1.getLocation)();
        const { emotion, confidence } = await (0, emotionService_1.analyzeEmotion)(req.file.path);
        const qrCode = await (0, qrcode_1.generateQRCode)(req.file.path);
        const analysis = new analysis_1.EmotionAnalysisModel({
            userId: authReq.user.id,
            audioUrl: req.file.path,
            emotion,
            confidence,
            qrCodeUrl: qrCode,
            location,
            apiToken: authReq.user.apiToken
        });
        await analysis.save();
        res.status(201).json(analysis);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const analysis = await analysis_1.EmotionAnalysisModel.findOneAndUpdate({ _id: req.params.id, userId: authReq.user.id }, req.body, { new: true });
        if (!analysis) {
            return res.status(404).json({ error: 'Emotion analysis not found' });
        }
        res.json(analysis);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const analysis = await analysis_1.EmotionAnalysisModel.findOneAndDelete({
            _id: req.params.id,
            userId: authReq.user.id
        });
        if (!analysis) {
            return res.status(404).json({ error: 'Emotion analysis not found' });
        }
        res.json({ message: 'Emotion analysis deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=emotion.js.map