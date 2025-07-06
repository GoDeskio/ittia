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
    this.API_BASE_URL = apiBaseUrl || process.env.REACT_APP_API_URL || 'http://localhost:3000';
  }

  public static getInstance(apiBaseUrl?: string): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService(apiBaseUrl);
    }
    return UpdateService.instance;
  }

  /**
   * Get current application version from package.json
   */
  public getCurrentVersion(): string {
    // This will be overridden by platform-specific implementations
    return '1.0.0';
  }

  /**
   * Get platform identifier
   */
  public getPlatform(): 'web' | 'desktop' | 'mobile' {
    if (typeof window !== 'undefined') {
      // Check if running in Electron
      if ((window as any).require) {
        return 'desktop';
      }
      // Check if running in mobile browser or React Native
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return 'mobile';
      }
      return 'web';
    }
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
        },
        timeout: 10000 // 10 second timeout
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
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Compare two version strings (semantic versioning)
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    const maxLength = Math.max(parts1.length, parts2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  /**
   * Start automatic update checking
   */
  public startAutoCheck(onUpdateAvailable?: (result: UpdateCheckResult) => void): void {
    // Clear existing timer
    this.stopAutoCheck();

    // Check immediately
    this.checkForUpdates().then(result => {
      if (result.hasUpdate && onUpdateAvailable) {
        onUpdateAvailable(result);
      }
    });

    // Set up periodic checking
    this.checkTimer = setInterval(async () => {
      try {
        const result = await this.checkForUpdates();
        if (result.hasUpdate && onUpdateAvailable) {
          onUpdateAvailable(result);
        }
      } catch (error) {
        console.error('Auto update check failed:', error);
      }
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
   * Get the last update check timestamp
   */
  public getLastCheckTime(): Date | null {
    const timestamp = localStorage.getItem('lastUpdateCheck');
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }

  /**
   * Set the last update check timestamp
   */
  private setLastCheckTime(): void {
    localStorage.setItem('lastUpdateCheck', Date.now().toString());
  }

  /**
   * Check if we should skip showing update notification (user dismissed it)
   */
  public shouldSkipVersion(version: string): boolean {
    const skippedVersions = JSON.parse(localStorage.getItem('skippedVersions') || '[]');
    return skippedVersions.includes(version);
  }

  /**
   * Mark a version as skipped
   */
  public skipVersion(version: string): void {
    const skippedVersions = JSON.parse(localStorage.getItem('skippedVersions') || '[]');
    if (!skippedVersions.includes(version)) {
      skippedVersions.push(version);
      localStorage.setItem('skippedVersions', JSON.stringify(skippedVersions));
    }
  }

  /**
   * Clear skipped versions (useful when user manually checks for updates)
   */
  public clearSkippedVersions(): void {
    localStorage.removeItem('skippedVersions');
  }
}

export default UpdateService;