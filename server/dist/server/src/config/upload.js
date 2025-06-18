"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const defaultConfig = {
    maxFileSize: 25 * 1024 * 1024 * 1024,
    allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'audio/mpeg',
        'audio/wav'
    ],
    uploadPath: 'uploads/'
};
exports.defaultConfig = defaultConfig;
//# sourceMappingURL=upload.js.map