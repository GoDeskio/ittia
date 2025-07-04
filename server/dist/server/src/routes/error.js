"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const errorLogging_service_1 = require("../services/errorLogging.service");
const passport_1 = __importDefault(require("passport"));
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
router.post('/report', errorLogging_service_1.errorScreenshotUpload.array('screenshots', 10), [
    (0, express_validator_1.body)('errorType').isString().notEmpty(),
    (0, express_validator_1.body)('description').isString().notEmpty(),
    validation_1.validateRequest
], async (req, res) => {
    var _a;
    try {
        const errorData = {
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            errorType: req.body.errorType,
            description: req.body.description,
            userAgent: req.headers['user-agent'] || '',
            route: req.body.route || req.headers.referer || '',
            stackTrace: req.body.stackTrace,
            screenshots: req.files || []
        };
        const errorLog = await errorLogging_service_1.errorLoggingService.logError(errorData);
        res.status(201).json(errorLog);
    }
    catch (error) {
        console.error('Error submitting error report:', error);
        res.status(500).json({ message: 'Failed to submit error report' });
    }
});
router.get('/logs', passport_1.default.authenticate('jwt', { session: false }), adminAuth_1.isAdmin, async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
            userId: req.query.userId,
            errorType: req.query.errorType
        };
        const logs = await errorLogging_service_1.errorLoggingService.getErrorLogs(filters);
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching error logs:', error);
        res.status(500).json({ message: 'Failed to fetch error logs' });
    }
});
router.patch('/logs/:errorId', passport_1.default.authenticate('jwt', { session: false }), adminAuth_1.isAdmin, [
    (0, express_validator_1.body)('status').isIn(['new', 'in-progress', 'resolved']),
    (0, express_validator_1.body)('resolution').optional().isString(),
    (0, express_validator_1.body)('assignedTo').optional().isString(),
    validation_1.validateRequest
], async (req, res) => {
    try {
        const { errorId } = req.params;
        const update = {
            status: req.body.status,
            resolution: req.body.resolution,
            assignedTo: req.body.assignedTo
        };
        const updatedLog = await errorLogging_service_1.errorLoggingService.updateErrorStatus(errorId, update);
        if (!updatedLog) {
            return res.status(404).json({ message: 'Error log not found' });
        }
        res.json(updatedLog);
    }
    catch (error) {
        console.error('Error updating error log:', error);
        res.status(500).json({ message: 'Failed to update error log' });
    }
});
exports.default = router;
//# sourceMappingURL=error.js.map