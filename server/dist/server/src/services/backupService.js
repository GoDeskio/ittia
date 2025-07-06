"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = exports.BackupService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const ErrorLog_1 = require("../models/ErrorLog");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BackupService {
    constructor() {
        this.backupDir = path_1.default.join(__dirname, '../../backups');
        this.screenshotsDir = path_1.default.join(__dirname, '../../uploads/error-screenshots');
        this.ensureDirectories();
    }
    ensureDirectories() {
        if (!fs_1.default.existsSync(this.backupDir)) {
            fs_1.default.mkdirSync(this.backupDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.screenshotsDir)) {
            fs_1.default.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }
    async backupScreenshots() {
        try {
            const date = new Date();
            const backupName = `error-screenshots-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const backupPath = path_1.default.join(this.backupDir, backupName);
            if (!fs_1.default.existsSync(backupPath)) {
                fs_1.default.mkdirSync(backupPath);
            }
            const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
            const recentLogs = await ErrorLog_1.ErrorLog.find({
                timestamp: { $gte: yesterday },
                screenshots: { $exists: true, $ne: [] }
            });
            for (const log of recentLogs) {
                const logDir = path_1.default.join(backupPath, log._id.toString());
                fs_1.default.mkdirSync(logDir);
                for (const screenshot of log.screenshots) {
                    const screenshotName = path_1.default.basename(screenshot);
                    const sourcePath = path_1.default.join(this.screenshotsDir, screenshotName);
                    const destPath = path_1.default.join(logDir, screenshotName);
                    if (fs_1.default.existsSync(sourcePath)) {
                        fs_1.default.copyFileSync(sourcePath, destPath);
                    }
                }
            }
            const zipName = `${backupName}.zip`;
            await execAsync(`zip -r "${path_1.default.join(this.backupDir, zipName)}" "${backupPath}"`);
            fs_1.default.rmSync(backupPath, { recursive: true, force: true });
            const thirtyDaysAgo = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
            const backups = fs_1.default.readdirSync(this.backupDir);
            for (const backup of backups) {
                if (!backup.endsWith('.zip'))
                    continue;
                const backupDate = new Date(backup.split('-').slice(2, 5).join('-').replace('.zip', ''));
                if (backupDate < thirtyDaysAgo) {
                    fs_1.default.unlinkSync(path_1.default.join(this.backupDir, backup));
                }
            }
            console.log(`Backup completed: ${zipName}`);
        }
        catch (error) {
            console.error('Error during backup:', error);
            throw error;
        }
    }
    async restoreScreenshots(backupDate) {
        try {
            const backupName = `error-screenshots-${backupDate.getFullYear()}-${(backupDate.getMonth() + 1).toString().padStart(2, '0')}-${backupDate.getDate().toString().padStart(2, '0')}.zip`;
            const backupPath = path_1.default.join(this.backupDir, backupName);
            if (!fs_1.default.existsSync(backupPath)) {
                throw new Error(`Backup not found: ${backupName}`);
            }
            const tempDir = path_1.default.join(this.backupDir, 'temp-restore');
            if (fs_1.default.existsSync(tempDir)) {
                fs_1.default.rmSync(tempDir, { recursive: true, force: true });
            }
            fs_1.default.mkdirSync(tempDir);
            await execAsync(`unzip "${backupPath}" -d "${tempDir}"`);
            const logDirs = fs_1.default.readdirSync(tempDir);
            for (const logDir of logDirs) {
                const screenshots = fs_1.default.readdirSync(path_1.default.join(tempDir, logDir));
                for (const screenshot of screenshots) {
                    const sourcePath = path_1.default.join(tempDir, logDir, screenshot);
                    const destPath = path_1.default.join(this.screenshotsDir, screenshot);
                    fs_1.default.copyFileSync(sourcePath, destPath);
                }
            }
            fs_1.default.rmSync(tempDir, { recursive: true, force: true });
            console.log(`Restore completed from backup: ${backupName}`);
        }
        catch (error) {
            console.error('Error during restore:', error);
            throw error;
        }
    }
}
exports.BackupService = BackupService;
exports.backupService = new BackupService();
//# sourceMappingURL=backupService.js.map