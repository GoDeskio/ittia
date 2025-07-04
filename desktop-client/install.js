const DependencyManager = require('../scripts/dependency-manager');
const { execSync } = require('child_process');
const path = require('path');

async function installDesktop() {
  console.log('Starting VoiceVault Desktop installation...');
  
  const manager = new DependencyManager('desktop');
  
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
    
    // Build the application
    console.log('Building desktop application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('VoiceVault Desktop installation completed successfully!');
  } catch (error) {
    console.error('Installation failed:', error.message);
    process.exit(1);
  }
}

installDesktop(); 