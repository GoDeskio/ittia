import axios from 'axios';

export interface VersionInfo {
  version: string;
  releaseDate: string;
  downloadUrl?: string;
  releaseNotes: string[];
  critical: boolean;
  platform: 'web' | 'desktop' | 'mobile';
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  versionInfo?: VersionInfo;
  error?: string;
}

export class UpdateService {
  private static instance: UpdateService;
  private readonly API_BASE_URL: string;
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private checkTimer: NodeJS.Timeout | null = null;

  constructor(apiBaseUrl?: string) {
    this.API_BASE_URL = apiBaseUrl || process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  public static getInstance(apiBaseUrl?: string): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService(apiBaseUrl);
    }
    return UpdateService.instance;
  }

  /**
   * Get current application version
   */
  public getCurrentVersion(): string {
    return process.env.REACT_APP_VERSION || '1.0.0';
  }

  /**
   * Get platform identifier
   */
  public getPlatform(): 'web' | 'desktop' | 'mobile' {
    return 'web';
  }

  /**
   * Check for updates from the server
   */
  public async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      const currentVersion = this.getCurrentVersion();
      const platform = this.getPlatform();

      const response = await axios.get(`${this.API_BASE_URL}/api/version/check`, {
        params: {
          currentVersion,
          platform
        }
      });

      const versionInfo: VersionInfo = response.data;
      const hasUpdate = this.compareVersions(currentVersion, versionInfo.version) < 0;

      return {
        hasUpdate,
        currentVersion,
        latestVersion: versionInfo.version,
        versionInfo: hasUpdate ? versionInfo : undefined
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return {
        hasUpdate: false,
        currentVersion: this.getCurrentVersion(),
        error: error instanceof Error ? error.message : 'Failed to check for updates'
      };
    }
  }

  /**
   * Start automatic update checking
   */
  public startAutoCheck(onUpdateAvailable: (result: UpdateCheckResult) => void): void {
    this.stopAutoCheck();
    
    // Check immediately
    this.checkForUpdates().then(onUpdateAvailable);
    
    // Set up periodic checking
    this.checkTimer = setInterval(() => {
      this.checkForUpdates().then(onUpdateAvailable);
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop automatic update checking
   */
  public stopAutoCheck(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * Skip a specific version
   */
  public skipVersion(version: string): void {
    const skippedVersions = this.getSkippedVersions();
    if (!skippedVersions.includes(version)) {
      skippedVersions.push(version);
      localStorage.setItem('skippedVersions', JSON.stringify(skippedVersions));
    }
  }

  /**
   * Check if a version should be skipped
   */
  public shouldSkipVersion(version: string): boolean {
    const skippedVersions = this.getSkippedVersions();
    return skippedVersions.includes(version);
  }

  /**
   * Get list of skipped versions
   */
  public getSkippedVersions(): string[] {
    try {
      const stored = localStorage.getItem('skippedVersions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all skipped versions
   */
  public clearSkippedVersions(): void {
    localStorage.removeItem('skippedVersions');
  }

  /**
   * Get last check time
   */
  public getLastCheckTime(): Date | null {
    try {
      const stored = localStorage.getItem('lastUpdateCheck');
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Compare two version strings
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }
}