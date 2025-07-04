"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../../../client/public/assets');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const iconType = req.body.type;
        const extension = path_1.default.extname(file.originalname);
        let filename;
        switch (iconType) {
            case 'loading':
                filename = 'loading.gif';
                break;
            case 'desktop':
                filename = 'desktop-icon.png';
                break;
            case 'mobile':
                filename = 'mobile-icon.png';
                break;
            case 'favicon':
                filename = 'favicon.ico';
                break;
            default:
                return cb(new Error('Invalid icon type'), '');
        }
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed'));
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
router.post('/', [auth_1.isAdmin], upload.single('icon'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({
            message: 'Icon updated successfully',
            filename: req.file.filename
        });
    }
    catch (error) {
        console.error('Error uploading icon:', error);
        res.status(500).json({ error: 'Failed to upload icon' });
    }
});
exports.default = router;
//# sourceMappingURL=icons.js.map