import cron from 'node-cron';
import { backupService } from '../services/backupService';

// Run backup every day at 2 AM
export const initializeBackupCron = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Starting daily error screenshots backup...');
      await backupService.backupScreenshots();
      console.log('Daily backup completed successfully');
    } catch (error) {
      console.error('Error during daily backup:', error);
    }
  });
}; 