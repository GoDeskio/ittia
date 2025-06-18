"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaService = exports.MediaService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const sharp_1 = __importDefault(require("sharp"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
const mkdir = (0, util_1.promisify)(fs_1.default.mkdir);
const MAX_FILE_SIZE = 1024 * 1024 * 1024;
class MediaService {
    constructor() {
        if (!fs_1.default.existsSync(MediaService.UPLOAD_DIR)) {
            fs_1.default.mkdirSync(MediaService.UPLOAD_DIR, { recursive: true });
        }
    }
    generateFileName(originalName) {
        const ext = path_1.default.extname(originalName);
        const hash = (0, crypto_1.createHash)('md5').update(Date.now().toString()).digest('hex');
        return `${(0, uuid_1.v4)()}-${hash}${ext}`;
    }
    async generateThumbnail(filePath, type) {
        const thumbnailFileName = `thumb_${path_1.default.basename(filePath)}`;
        const thumbnailPath = path_1.default.join(MediaService.UPLOAD_DIR, 'thumbnails', thumbnailFileName);
        await mkdir(path_1.default.dirname(thumbnailPath), { recursive: true });
        if (type === 'image') {
            await (0, sharp_1.default)(filePath)
                .resize(300, 300, {
                fit: 'cover',
                position: 'center'
            })
                .toFile(thumbnailPath);
        }
        else if (type === 'video') {
            await new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(filePath)
                    .screenshots({
                    timestamps: ['00:00:01'],
                    filename: thumbnailFileName,
                    folder: path_1.default.join(MediaService.UPLOAD_DIR, 'thumbnails'),
                    size: '300x300'
                })
                    .on('end', resolve)
                    .on('error', reject);
            });
        }
        return `/uploads/thumbnails/${thumbnailFileName}`;
    }
    async uploadFile(file, type) {
        if (!file) {
            throw new Error('No file provided');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('File size exceeds maximum limit of 1GB');
        }
        const isImage = MediaService.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
        const isVideo = MediaService.ALLOWED_VIDEO_TYPES.includes(file.mimetype);
        if (!isImage && !isVideo) {
            throw new Error('Invalid file type');
        }
        const fileName = this.generateFileName(file.originalname);
        const filePath = path_1.default.join(MediaService.UPLOAD_DIR, type, fileName);
        await mkdir(path_1.default.dirname(filePath), { recursive: true });
        await fs_1.default.promises.rename(file.path, filePath);
        const mediaType = file.mimetype === 'image/gif' ? 'gif' :
            isImage ? 'image' : 'video';
        const thumbnailUrl = await this.generateThumbnail(filePath, isImage ? 'image' : 'video');
        return {
            url: `/uploads/${type}/${fileName}`,
            type: mediaType,
            thumbnailUrl
        };
    }
    async deleteFile(filePath) {
        const fullPath = path_1.default.join(MediaService.UPLOAD_DIR, filePath);
        const thumbnailPath = path_1.default.join(MediaService.UPLOAD_DIR, 'thumbnails', `thumb_${path_1.default.basename(filePath)}`);
        try {
            await fs_1.default.promises.unlink(fullPath);
            if (fs_1.default.existsSync(thumbnailPath)) {
                await fs_1.default.promises.unlink(thumbnailPath);
            }
        }
        catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to delete file');
        }
    }
}
exports.MediaService = MediaService;
MediaService.UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
MediaService.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
MediaService.ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
exports.mediaService = new MediaService();
//# sourceMappingURL=mediaService.js.map