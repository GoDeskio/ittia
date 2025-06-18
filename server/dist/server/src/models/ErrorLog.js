"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ErrorLogSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    errorType: { type: String, required: true, index: true },
    description: { type: String, required: true },
    userAgent: { type: String },
    route: { type: String, index: true },
    stackTrace: { type: String },
    screenshots: [{ type: String }],
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved'],
        default: 'new',
        index: true
    },
    resolution: { type: String },
    assignedTo: { type: String, index: true }
}, {
    timestamps: true
});
ErrorLogSchema.index({ status: 1, timestamp: -1 });
ErrorLogSchema.index({ errorType: 1, status: 1 });
ErrorLogSchema.index({ userId: 1, timestamp: -1 });
ErrorLogSchema.index({
    errorType: 'text',
    description: 'text',
    resolution: 'text'
}, {
    weights: {
        errorType: 10,
        description: 5,
        resolution: 3
    }
});
ErrorLogSchema.pre('remove', async function () {
    const errorLog = this;
    if (errorLog.screenshots && errorLog.screenshots.length > 0) {
        const fs = require('fs').promises;
        await Promise.all(errorLog.screenshots.map(screenshot => fs.unlink(screenshot).catch(err => console.error(`Failed to delete screenshot ${screenshot}:`, err))));
    }
});
ErrorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { status: 'resolved' } });
exports.ErrorLog = mongoose_1.default.model('ErrorLog', ErrorLogSchema);
//# sourceMappingURL=ErrorLog.js.map