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
exports.EmotionAnalysisModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const locationSchema = new mongoose_1.Schema({
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    timestamp: {
        type: Date,
        required: true
    }
}, { _id: false });
const emotionAnalysisSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    emotion: {
        type: String,
        enum: ['angry', 'happy', 'neutral', 'sad'],
        required: true
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    qrCodeUrl: {
        type: String,
        required: true
    },
    location: {
        type: locationSchema,
        required: true
    },
    apiToken: {
        type: String,
        required: true
    },
    word: {
        type: String,
        required: false
    },
    color: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
emotionAnalysisSchema.index({ userId: 1, createdAt: -1 });
emotionAnalysisSchema.index({ apiToken: 1 });
emotionAnalysisSchema.index({ emotion: 1 });
emotionAnalysisSchema.index({ 'location.timestamp': -1 });
emotionAnalysisSchema.virtual('metadata').get(function () {
    return {
        word: this.word,
        emotion: this.emotion,
        color: this.color,
        location: {
            latitude: this.location.latitude,
            longitude: this.location.longitude,
            timestamp: this.location.timestamp.toISOString()
        },
        apiToken: this.apiToken,
        qrCode: this.qrCodeUrl
    };
});
delete emotionAnalysisSchema.methods.toJSON;
exports.EmotionAnalysisModel = mongoose_1.default.model('EmotionAnalysis', emotionAnalysisSchema);
//# sourceMappingURL=analysis.js.map