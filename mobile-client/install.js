const DependencyManager = require('../scripts/dependency-manager');
const { execSync } = require('child_process');
const path = require('path');

async function installMobile() {
  console.log('Starting VoiceVault Mobile installation...');
  
  const manager = new DependencyManager('mobile');
  
  try {
    // Check Node.js version
    await manager.checkNodeVersion();
    
    // Install dependencies
    const installed = await manager.installDependencies();
    if (!installed) {
      throw new Error('Failed to install dependencies');
    }
    
    // Validate dependencies
    const validated = await manager.validateDependencies();
    if (!validated) {
      throw new Error('Dependency validation failed');
    }
    
    // Check security
    const secure = await manager.checkSecurity();
    if (!secure) {
      console.warn('Security vulnerabilities found. Please review and update dependencies.');
    }
    
    // Install iOS dependencies (if on macOS)
    if (process.platform === 'darwin') {
      console.log('Installing iOS dependencies...');
      execSync('cd ios && pod install', { stdio: 'inherit' });
    }
    
    // Link native dependencies
    console.log('Linking native dependencies...');
    execSync('npx react-native link', { stdio: 'inherit' });
    
    console.log('VoiceVault Mobile installation completed successfully!');
  } catch (error) {
    console.error('Installation failed:', error.message);
    process.exit(1);
  }
}

installMobile(); 