import axios from 'axios';
import { Acquaintance, UnknownVoiceRecording, Folder, Tag } from '../types/acquaintance';

class AcquaintanceService {
  private static instance: AcquaintanceService;
  private readonly API_BASE_URL = '/api/acquaintances';
  private folders: Folder[] = [];
  private tags: Tag[] = [];

  private constructor() {
    // Initialize with default folders and tags
    this.folders = [
      {
        id: 'family',
        name: 'Family',
        icon: 'family',
        acquaintanceIds: [],
        subfolders: [
          { id: 'parents', name: 'Parents', acquaintanceIds: [] },
          { id: 'siblings', name: 'Siblings', acquaintanceIds: [] },
        ],
      },
      {
        id: 'friends',
        name: 'Friends',
        icon: 'friends',
        acquaintanceIds: [],
        subfolders: [
          { id: 'close-friends', name: 'Close Friends', acquaintanceIds: [] },
          { id: 'school-friends', name: 'School Friends', acquaintanceIds: [] },
          { id: 'work-friends', name: 'Work Friends', acquaintanceIds: [] },
        ],
      },
      {
        id: 'work',
        name: 'Work',
        icon: 'work',
        acquaintanceIds: [],
        subfolders: [
          { id: 'colleagues', name: 'Colleagues', acquaintanceIds: [] },
          { id: 'clients', name: 'Clients', acquaintanceIds: [] },
        ],
      },
    ];

    this.tags = [
      { id: 'family', name: 'Family', color: '#4CAF50' },
      { id: 'friend', name: 'Friend', color: '#2196F3' },
      { id: 'colleague', name: 'Colleague', color: '#9C27B0' },
      { id: 'brother', name: 'Brother', color: '#8BC34A' },
      { id: 'sister', name: 'Sister', color: '#E91E63' },
      { id: 'mother', name: 'Mother', color: '#FF9800' },
      { id: 'father', name: 'Father', color: '#795548' },
      { id: 'cousin', name: 'Cousin', color: '#607D8B' },
    ];
  }

  public static getInstance(): AcquaintanceService {
    if (!AcquaintanceService.instance) {
      AcquaintanceService.instance = new AcquaintanceService();
    }
    return AcquaintanceService.instance;
  }

  // Folder Management
  public async getFolders(): Promise<Folder[]> {
    return this.folders;
  }

  public async createFolder(name: string, parentId?: string): Promise<Folder> {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      acquaintanceIds: [],
    };

    if (parentId) {
      const updateFolders = (folders: Folder[]): boolean => {
        for (const folder of folders) {
          if (folder.id === parentId) {
            folder.subfolders = folder.subfolders || [];
            folder.subfolders.push(newFolder);
            return true;
          }
          const subfolders = folder.subfolders;
          if (subfolders && subfolders.length > 0) {
            if (updateFolders(subfolders)) {
              return true;
            }
          }
        }
        return false;
      };

      if (!updateFolders(this.folders)) {
        throw new Error('Parent folder not found');
      }
    } else {
      this.folders.push(newFolder);
    }

    return newFolder;
  }

  public async updateFolder(folderId: string, updates: Partial<Folder>): Promise<Folder> {
    const updateFolderInList = (folders: Folder[]): boolean => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          Object.assign(folder, updates);
          return true;
        }
        const subfolders = folder.subfolders;
        if (subfolders && subfolders.length > 0) {
          if (updateFolderInList(subfolders)) {
            return true;
          }
        }
      }
      return false;
    };

    if (!updateFolderInList(this.folders)) {
      throw new Error('Folder not found');
    }

    const folder = await this.getFolder(folderId);
    return folder;
  }

  public async deleteFolder(folderId: string): Promise<void> {
    const deleteFromList = (folders: Folder[]): boolean => {
      for (let i = 0; i < folders.length; i++) {
        if (folders[i].id === folderId) {
          folders.splice(i, 1);
          return true;
        }
        const subfolders = folders[i].subfolders;
        if (subfolders && subfolders.length > 0) {
          if (deleteFromList(subfolders)) {
            return true;
          }
        }
      }
      return false;
    };

    if (!deleteFromList(this.folders)) {
      throw new Error('Folder not found');
    }
  }

  public async getFolder(folderId: string): Promise<Folder> {
    const findFolder = (folders: Folder[]): Folder | null => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder;
        }
        const subfolders = folder.subfolders;
        if (subfolders && subfolders.length > 0) {
          const found = findFolder(subfolders);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const folder = findFolder(this.folders);
    if (!folder) {
      throw new Error('Folder not found');
    }

    return folder;
  }

  public async moveAcquaintanceToFolder(acquaintanceId: string, folderId: string): Promise<void> {
    // Remove from all current folders
    const removeFromFolders = (folders: Folder[]) => {
      for (const folder of folders) {
        folder.acquaintanceIds = folder.acquaintanceIds.filter(id => id !== acquaintanceId);
        const subfolders = folder.subfolders;
        if (subfolders && subfolders.length > 0) {
          removeFromFolders(subfolders);
        }
      }
    };

    removeFromFolders(this.folders);

    // Add to new folder
    const addToFolder = (folders: Folder[]): boolean => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          folder.acquaintanceIds.push(acquaintanceId);
          return true;
        }
        const subfolders = folder.subfolders;
        if (subfolders && subfolders.length > 0) {
          if (addToFolder(subfolders)) {
            return true;
          }
        }
      }
      return false;
    };

    if (!addToFolder(this.folders)) {
      throw new Error('Target folder not found');
    }
  }

  // Tag Management
  public async getTags(): Promise<Tag[]> {
    return this.tags;
  }

  public async createTag(name: string, color?: string): Promise<Tag> {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color,
    };
    this.tags.push(newTag);
    return newTag;
  }

  public async deleteTag(tagId: string): Promise<void> {
    const index = this.tags.findIndex(tag => tag.id === tagId);
    if (index === -1) {
      throw new Error('Tag not found');
    }
    this.tags.splice(index, 1);
  }

  // Get all acquaintances
  public async getAcquaintances(): Promise<Acquaintance[]> {
    const response = await axios.get(`${this.API_BASE_URL}`);
    return response.data;
  }

  // Get unknown voice recordings
  public async getUnknownRecordings(): Promise<UnknownVoiceRecording[]> {
    const response = await axios.get(`${this.API_BASE_URL}/unknown`);
    return response.data;
  }

  // Create new acquaintance from unknown voice
  public async createAcquaintance(data: {
    firstName: string;
    lastName: string;
    recordingIds: string[];
    metadata?: {
      notes?: string;
      relationship?: string;
      tags?: string[];
    };
  }): Promise<Acquaintance> {
    const response = await axios.post(`${this.API_BASE_URL}`, data);
    return response.data;
  }

  // Update existing acquaintance
  public async updateAcquaintance(
    id: string,
    data: Partial<Acquaintance>
  ): Promise<Acquaintance> {
    const response = await axios.patch(`${this.API_BASE_URL}/${id}`, data);
    return response.data;
  }

  // Delete acquaintance
  public async deleteAcquaintance(id: string): Promise<void> {
    await axios.delete(`${this.API_BASE_URL}/${id}`);
  }

  // Link unknown recording to acquaintance
  public async linkRecordingToAcquaintance(
    recordingId: string,
    acquaintanceId: string
  ): Promise<void> {
    await axios.post(`${this.API_BASE_URL}/link`, {
      recordingId,
      acquaintanceId,
    });
  }

  // Get recordings by acquaintance
  public async getAcquaintanceRecordings(
    acquaintanceId: string
  ): Promise<UnknownVoiceRecording[]> {
    const response = await axios.get(
      `${this.API_BASE_URL}/${acquaintanceId}/recordings`
    );
    return response.data;
  }

  // Search acquaintances
  public async searchAcquaintances(query: {
    name?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
  }): Promise<Acquaintance[]> {
    const response = await axios.get(`${this.API_BASE_URL}/search`, {
      params: query,
    });
    return response.data;
  }
}

export default AcquaintanceService; 