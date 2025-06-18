"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBackupCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const backupService_1 = require("../services/backupService");
const initializeBackupCron = () => {
    node_cron_1.default.schedule('0 2 * * *', async () => {
        try {
            console.log('Starting daily error screenshots backup...');
            await backupService_1.backupService.backupScreenshots();
            console.log('Daily backup completed successfully');
        }
        catch (error) {
            console.error('Error during daily backup:', error);
        }
    });
};
exports.initializeBackupCron = initializeBackupCron;
//# sourceMappingURL=backupCron.js.map