import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

interface VersionInfo {
  version: string;
  releaseDate: string;
  downloadUrl?: string;
  releaseNotes: string[];
  critical: boolean;
  platform: 'web' | 'desktop' | 'mobile';
}

interface VersionConfig {
  web: VersionInfo;
  desktop: VersionInfo;
  mobile: VersionInfo;
}

// Load version configuration
const getVersionConfig = (): VersionConfig => {
  try {
    // Try to load from a version config file first
    const configPath = path.join(__dirname, '../../config/versions.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load version config file, using package.json fallback');
  }

  // Fallback to package.json version
  const packageJsonPath = path.join(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  const releaseDate = new Date().toISOString();

  return {
    web: {
      version: currentVersion,
      releaseDate,
      releaseNotes: ['Current stable version'],
      critical: false,
      platform: 'web'
    },
    desktop: {
      version: currentVersion,
      releaseDate,
      downloadUrl: process.env.DESKTOP_DOWNLOAD_URL,
      releaseNotes: ['Current stable version'],
      critical: false,
      platform: 'desktop'
    },
    mobile: {
      version: currentVersion,
      releaseDate,
      downloadUrl: process.env.MOBILE_DOWNLOAD_URL,
      releaseNotes: ['Current stable version'],
      critical: false,
      platform: 'mobile'
    }
  };
};

/**
 * GET /api/version/check
 * Check for application updates
 */
router.get('/check', async (req: Request, res: Response) => {
  try {
    const { currentVersion, platform } = req.query;

    if (!currentVersion || !platform) {
      return res.status(400).json({
        error: 'Missing required parameters: currentVersion and platform'
      });
    }

    const platformType = platform as 'web' | 'desktop' | 'mobile';
    if (!['web', 'desktop', 'mobile'].includes(platformType)) {
      return res.status(400).json({
        error: 'Invalid platform. Must be one of: web, desktop, mobile'
      });
    }

    const versionConfig = getVersionConfig();
    const latestVersionInfo = versionConfig[platformType];

    // Log the version check for analytics
    console.log(`Version check: ${platformType} v${currentVersion} -> v${latestVersionInfo.version}`);

    res.json(latestVersionInfo);
  } catch (error) {
    console.error('Error checking version:', error);
    res.status(500).json({
      error: 'Internal server error while checking version'
    });
  }
});

/**
 * GET /api/version/current
 * Get current server version info
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    const versionConfig = getVersionConfig();
    res.json({
      server: {
        version: versionConfig.web.version,
        releaseDate: versionConfig.web.releaseDate
      },
      platforms: versionConfig
    });
  } catch (error) {
    console.error('Error getting current version:', error);
    res.status(500).json({
      error: 'Internal server error while getting version info'
    });
  }
});

/**
 * POST /api/version/update-config
 * Update version configuration (admin only)
 */
router.post('/update-config', async (req: Request, res: Response) => {
  try {
    // This would typically require admin authentication
    // For now, we'll just validate the structure
    const { web, desktop, mobile } = req.body;

    if (!web || !desktop || !mobile) {
      return res.status(400).json({
        error: 'Missing platform configurations'
      });
    }

    // Validate each platform config
    const platforms = { web, desktop, mobile };
    for (const [platform, config] of Object.entries(platforms)) {
      if (!config.version || !config.releaseDate || !Array.isArray(config.releaseNotes)) {
        return res.status(400).json({
          error: `Invalid configuration for platform: ${platform}`
        });
      }
    }

    // Save to config file
    const configPath = path.join(__dirname, '../../config/versions.json');
    const configDir = path.dirname(configPath);
    
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(platforms, null, 2));

    res.json({
      message: 'Version configuration updated successfully',
      config: platforms
    });
  } catch (error) {
    console.error('Error updating version config:', error);
    res.status(500).json({
      error: 'Internal server error while updating version config'
    });
  }
});

export default router;