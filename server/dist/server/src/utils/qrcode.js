"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const generateQRCode = async (audioPath) => {
    const qrCodeDir = path_1.default.join(__dirname, '../../uploads/qrcodes');
    if (!fs_1.default.existsSync(qrCodeDir)) {
        fs_1.default.mkdirSync(qrCodeDir, { recursive: true });
    }
    const qrCodePath = path_1.default.join(qrCodeDir, `${path_1.default.basename(audioPath)}.png`);
    await qrcode_1.default.toFile(qrCodePath, audioPath);
    return qrCodePath;
};
exports.generateQRCode = generateQRCode;
//# sourceMappingURL=qrcode.js.map