"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const AudioFile_1 = require("../models/AudioFile");
const CachedAudio_1 = require("../models/CachedAudio");
const adminAuth_1 = require("../middleware/adminAuth");
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
exports.adminRoutes = router;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
router.use(adminAuth_1.authenticateAdmin);
router.get('/stats', async (req, res) => {
    try {
        const [users, audioFiles, cachedFiles] = await Promise.all([
            User_1.User.findAll(),
            AudioFile_1.AudioFile.findAll(),
            CachedAudio_1.CachedAudio.findAll()
        ]);
        const totalStorageUsed = audioFiles.reduce((sum, file) => sum + file.size, 0) +
            cachedFiles.reduce((sum, file) => sum + file.size, 0);
        const stats = {
            totalUsers: users.length,
            totalAudioFiles: audioFiles.length,
            totalCachedFiles: cachedFiles.length,
            totalStorageUsed
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching system stats:', error);
        res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
});
router.get('/users', async (req, res) => {
    try {
        const users = await User_1.User.findAll();
        res.json(users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            storage_quota: user.storage_quota,
            storage_used: user.storage_used,
            created_at: user.created_at
        })));
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
router.put('/users/:id/quota', async (req, res) => {
    try {
        const { id } = req.params;
        const { storage_quota } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        if (typeof storage_quota !== 'number' || storage_quota < 0) {
            return res.status(400).json({ error: 'Invalid storage quota value' });
        }
        const user = await User_1.User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await User_1.User.update(id, { storage_quota });
        res.json({ message: 'Storage quota updated successfully' });
    }
    catch (error) {
        console.error('Error updating storage quota:', error);
        res.status(500).json({ error: 'Failed to update storage quota' });
    }
});
router.post('/cleanup', async (req, res) => {
    try {
        const { daysOld } = req.body;
        if (typeof daysOld !== 'number' || daysOld < 1) {
            return res.status(400).json({ error: 'Invalid days value' });
        }
        await CachedAudio_1.CachedAudio.cleanupOldFiles(daysOld);
        res.json({ message: 'Cleanup completed successfully' });
    }
    catch (error) {
        console.error('Error cleaning up old files:', error);
        res.status(500).json({ error: 'Failed to clean up old files' });
    }
});
router.get('/source-code', adminAuth_1.authenticateAdmin, adminAuth_1.requireGodMode, async (req, res) => {
    try {
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        const rootDir = path_1.default.join(__dirname, '..', '..');
        res.attachment('voicevault-source.zip');
        archive.pipe(res);
        archive.glob('**/*', {
            cwd: rootDir,
            ignore: [
                'node_modules/**',
                'uploads/**',
                'logs/**',
                '.env',
                '*.log',
                '*.zip',
            ],
        });
        await archive.finalize();
    }
    catch (error) {
        console.error('Error creating source code archive:', error);
        res.status(500).json({ error: 'Error downloading source code' });
    }
});
router.get('/user-activity/:userId', adminAuth_1.authenticateAdmin, adminAuth_1.requireGodMode, async (req, res) => {
    try {
        const userId = req.params.userId;
        const [cachedAudios, audioFiles] = await Promise.all([
            CachedAudio_1.CachedAudio.findByUserId(userId, false),
            AudioFile_1.AudioFile.findByUserId(userId)
        ]);
        cachedAudios.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        audioFiles.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        res.json({
            cachedAudios,
            audioFiles,
        });
    }
    catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Error fetching user activity' });
    }
});
//# sourceMappingURL=admin.js.map