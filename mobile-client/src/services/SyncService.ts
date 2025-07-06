import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface SyncQueue {
  type: 'voice' | 'library' | 'profile';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncQueue[] = [];
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeSync();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initializeSync() {
    // Load existing sync queue
    const savedQueue = await AsyncStorage.getItem('syncQueue');
    if (savedQueue) {
      this.syncQueue = JSON.parse(savedQueue);
    }

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      this.sync();
    }, 5 * 60 * 1000); // Sync every 5 minutes

    // Listen for network changes
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.sync();
      }
    });
  }

  /**
   * Add an item to the sync queue
   */
  public async queueSync(item: Omit<SyncQueue, 'timestamp'>) {
    const syncItem: SyncQueue = {
      ...item,
      timestamp: Date.now(),
    };

    this.syncQueue.push(syncItem);
    await this.saveQueue();

    // Attempt immediate sync if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      this.sync();
    }
  }

  /**
   * Process the sync queue
   */
  private async sync() {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;
    const queue = [...this.syncQueue];

    try {
      for (const item of queue) {
        await this.processSyncItem(item);
        this.syncQueue = this.syncQueue.filter(q => q.timestamp !== item.timestamp);
      }
      await this.saveQueue();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single sync item
   */
  private async processSyncItem(item: SyncQueue) {
    try {
      switch (item.type) {
        case 'voice':
          await this.syncVoiceItem(item);
          break;
        case 'library':
          await this.syncLibraryItem(item);
          break;
        case 'profile':
          await this.syncProfileItem(item);
          break;
      }
    } catch (error) {
      console.error(`Error processing sync item:`, error);
      throw error;
    }
  }

  /**
   * Sync voice recording
   */
  private async syncVoiceItem(item: SyncQueue) {
    const { action, data } = item;

    switch (action) {
      case 'create':
        await api.post(`/voice/libraries/${data.libraryId}/recordings`, data);
        // Remove local file after successful sync
        await this.removeLocalFile(data.localUri);
        break;
      case 'delete':
        await api.delete(`/voice/libraries/${data.libraryId}/recordings/${data.recordingId}`);
        break;
    }
  }

  /**
   * Sync library
   */
  private async syncLibraryItem(item: SyncQueue) {
    const { action, data } = item;

    switch (action) {
      case 'create':
        await api.post('/voice/libraries', data);
        break;
      case 'update':
        await api.put(`/voice/libraries/${data.id}`, data);
        break;
      case 'delete':
        await api.delete(`/voice/libraries/${data.id}`);
        break;
    }
  }

  /**
   * Sync profile
   */
  private async syncProfileItem(item: SyncQueue) {
    const { action, data } = item;

    switch (action) {
      case 'update':
        await api.put('/users/profile', data);
        break;
    }
  }

  /**
   * Remove local file after successful sync
   */
  private async removeLocalFile(uri: string) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Error removing local file:', error);
    }
  }

  /**
   * Save sync queue to AsyncStorage
   */
  private async saveQueue() {
    await AsyncStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  /**
   * Clean up resources
   */
  public cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
} 