"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const passport_1 = __importDefault(require("passport"));
const messageService_1 = require("../services/messageService");
exports.messageRoutes = express_1.default.Router();
exports.messageRoutes.post('/', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.body)('recipientId').isMongoId(),
    (0, express_validator_1.body)('content').isString().notEmpty().trim(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const message = await messageService_1.messageService.sendMessage(req.user._id, req.body.recipientId, req.body.content);
        res.status(201).json(message);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.messageRoutes.get('/conversation/:userId', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.param)('userId').isMongoId(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const conversation = await messageService_1.messageService.getConversation(req.user._id, req.params.userId, page, limit);
        res.json(conversation);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.messageRoutes.get('/recent', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const conversations = await messageService_1.messageService.getRecentConversations(req.user._id);
        res.json(conversations);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.messageRoutes.post('/mark-read', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.body)('messageIds').isArray(),
    (0, express_validator_1.body)('messageIds.*').isMongoId(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        await messageService_1.messageService.markAsRead(req.body.messageIds, req.user._id);
        res.json({ message: 'Messages marked as read' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.messageRoutes.delete('/:messageId', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.param)('messageId').isMongoId(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        await messageService_1.messageService.deleteMessage(req.params.messageId, req.user._id);
        res.json({ message: 'Message deleted' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
exports.messageRoutes.post('/retention', passport_1.default.authenticate('jwt', { session: false }), [
    (0, express_validator_1.body)('retentionPeriod').isIn(['1h', '6h', '24h', '7d', '30d']),
    validation_1.validateRequest
], async (req, res) => {
    try {
        await messageService_1.messageService.updateMessageRetention(req.user._id, req.body.retentionPeriod);
        res.json({ message: 'Message retention period updated successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message: errorMessage });
    }
});
//# sourceMappingURL=message.js.map