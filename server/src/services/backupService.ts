import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { ErrorLog } from '../models/ErrorLog';

const execAsync = promisify(exec);

export class BackupService {
  private backupDir: string;
  private screenshotsDir: string;

  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.screenshotsDir = path.join(__dirname, '../../uploads/error-screenshots');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  async backupScreenshots(): Promise<void> {
    try {
      const date = new Date();
      const backupName = `error-screenshots-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const backupPath = path.join(this.backupDir, backupName);

      // Create backup directory
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath);
      }

      // Get all screenshots from the last 24 hours
      const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
      const recentLogs = await ErrorLog.find({
        timestamp: { $gte: yesterday },
        screenshots: { $exists: true, $ne: [] }
      });

      // Copy screenshots to backup directory
      for (const log of recentLogs) {
        const logDir = path.join(backupPath, log._id.toString());
        fs.mkdirSync(logDir);

        for (const screenshot of log.screenshots) {
          const screenshotName = path.basename(screenshot);
          const sourcePath = path.join(this.screenshotsDir, screenshotName);
          const destPath = path.join(logDir, screenshotName);

          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
          }
        }
      }

      // Create zip archive
      const zipName = `${backupName}.zip`;
      await execAsync(`zip -r "${path.join(this.backupDir, zipName)}" "${backupPath}"`);

      // Remove temporary backup directory
      fs.rmSync(backupPath, { recursive: true, force: true });

      // Remove backups older than 30 days
      const thirtyDaysAgo = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
      const backups = fs.readdirSync(this.backupDir);
      
      for (const backup of backups) {
        if (!backup.endsWith('.zip')) continue;
        
        const backupDate = new Date(backup.split('-').slice(2, 5).join('-').replace('.zip', ''));
        if (backupDate < thirtyDaysAgo) {
          fs.unlinkSync(path.join(this.backupDir, backup));
        }
      }

      console.log(`Backup completed: ${zipName}`);
    } catch (error) {
      console.error('Error during backup:', error);
      throw error;
    }
  }

  async restoreScreenshots(backupDate: Date): Promise<void> {
    try {
      const backupName = `error-screenshots-${backupDate.getFullYear()}-${(backupDate.getMonth() + 1).toString().padStart(2, '0')}-${backupDate.getDate().toString().padStart(2, '0')}.zip`;
      const backupPath = path.join(this.backupDir, backupName);

      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup not found: ${backupName}`);
      }

      const tempDir = path.join(this.backupDir, 'temp-restore');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      fs.mkdirSync(tempDir);

      // Extract zip archive
      await execAsync(`unzip "${backupPath}" -d "${tempDir}"`);

      // Copy screenshots back to screenshots directory
      const logDirs = fs.readdirSync(tempDir);
      for (const logDir of logDirs) {
        const screenshots = fs.readdirSync(path.join(tempDir, logDir));
        for (const screenshot of screenshots) {
          const sourcePath = path.join(tempDir, logDir, screenshot);
          const destPath = path.join(this.screenshotsDir, screenshot);
          fs.copyFileSync(sourcePath, destPath);
        }
      }

      // Clean up
      fs.rmSync(tempDir, { recursive: true, force: true });

      console.log(`Restore completed from backup: ${backupName}`);
    } catch (error) {
      console.error('Error during restore:', error);
      throw error;
    }
  }
}

export const backupService = new BackupService(); 