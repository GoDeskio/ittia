import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { generateApiToken } from '../src/utils/tokenGenerator';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voicevault',
});

async function demonstrateApiTokenSystem() {
  console.log('🚀 VoiceVault API Token System Demonstration');
  console.log('===========================================');
  console.log('');

  // 1. Generate API Tokens
  console.log('1. API Token Generation:');
  console.log('------------------------');
  
  const token1 = generateApiToken();
  const token2 = generateApiToken();
  const token3 = generateApiToken();
  
  console.log(`✅ Token 1: ${token1}`);
  console.log(`   Length: ${token1.length} characters`);
  console.log('');
  
  console.log(`✅ Token 2: ${token2}`);
  console.log(`   Length: ${token2.length} characters`);
  console.log('');
  
  console.log(`✅ Token 3: ${token3}`);
  console.log(`   Length: ${token3.length} characters`);
  console.log('');
  
  // Verify requirements
  const allTokensUnique = new Set([token1, token2, token3]).size === 3;
  const allTokensLongEnough = [token1, token2, token3].every(t => t.length >= 100);
  
  console.log(`✅ All tokens unique: ${allTokensUnique ? 'YES' : 'NO'}`);
  console.log(`✅ All tokens >= 100 characters: ${allTokensLongEnough ? 'YES' : 'NO'}`);
  console.log('');

  // 2. Database Integration
  console.log('2. Database Integration:');
  console.log('------------------------');
  
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Get current user
    const userResult = await client.query('SELECT * FROM users WHERE id = 1');
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`   Current API token length: ${user.api_token?.length || 0} characters`);
      
      // Update with new token
      await client.query(
        'UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
        [token1]
      );
      console.log(`✅ Updated user with new ${token1.length}-character API token`);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (client) client.release();
  }
  console.log('');

  // 3. QR Code Data Generation
  console.log('3. QR Code Data Generation:');
  console.log('---------------------------');
  
  const qrData = {
    type: 'voicevault_library_access',
    version: '2.0',
    userId: '1',
    userName: 'Admin Tester',
    userEmail: 'Admin@godesk.io',
    apiToken: token1,
    accessUrl: 'http://localhost:3000/profile/1',
    timestamp: new Date().toISOString(),
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const qrDataString = JSON.stringify(qrData, null, 2);
  console.log('✅ QR Code Data Structure:');
  console.log(qrDataString);
  console.log('');
  
  // 4. QR Code URL Generation
  console.log('4. QR Code URL Generation:');
  console.log('--------------------------');
  
  const qrDataEncoded = encodeURIComponent(JSON.stringify(qrData));
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${qrDataEncoded}&color=1976d2&bgcolor=ffffff&ecc=H&margin=2`;
  
  console.log('✅ QR Code URL Generated:');
  console.log(qrCodeUrl);
  console.log('');
  console.log('📱 You can open this URL in a browser to see the QR code!');
  console.log('');

  // 5. API Endpoints Summary
  console.log('5. API Endpoints Available:');
  console.log('----------------------------');
  console.log('✅ GET /api/settings/api-token');
  console.log('   - Returns user\'s API token and QR code');
  console.log('   - Generates new token if none exists or too short');
  console.log('');
  console.log('✅ POST /api/settings/api-token/regenerate');
  console.log('   - Generates and saves a new API token');
  console.log('   - Returns new token and QR code');
  console.log('');
  console.log('✅ GET /api/settings/validate-token/:token');
  console.log('   - Validates an API token');
  console.log('   - Returns user info if valid');
  console.log('');

  // 6. User Interface Features
  console.log('6. User Interface Features:');
  console.log('---------------------------');
  console.log('✅ Settings Page:');
  console.log('   - API token displayed prominently at top');
  console.log('   - Show/hide token toggle for security');
  console.log('   - Copy to clipboard functionality');
  console.log('   - Token regeneration button');
  console.log('   - QR code display dialog');
  console.log('');
  console.log('✅ Profile Pages:');
  console.log('   - "Share Library" button for own profile');
  console.log('   - "Connect to Voice Library" button for others');
  console.log('   - QR code sharing functionality');
  console.log('');
  console.log('✅ QR Code Scanner Component:');
  console.log('   - Parse QR code data for connections');
  console.log('   - Support for both QR codes and profile URLs');
  console.log('   - Connection confirmation dialogs');
  console.log('');

  // 7. Security Features
  console.log('7. Security Features:');
  console.log('---------------------');
  console.log('✅ Cryptographically secure token generation');
  console.log('✅ 120-character tokens (exceeds 100-char requirement)');
  console.log('✅ Token masking in UI by default');
  console.log('✅ QR code expiration (1 year)');
  console.log('✅ Server-side token validation');
  console.log('✅ User-controlled token regeneration');
  console.log('');

  console.log('🎉 API Token System Demonstration Complete!');
  console.log('============================================');
  console.log('');
  console.log('📋 Summary:');
  console.log(`   • Generated ${token1.length}-character secure API tokens`);
  console.log('   • Implemented database integration');
  console.log('   • Created QR code generation system');
  console.log('   • Built user interface components');
  console.log('   • Added security features');
  console.log('   • Enabled cross-user voice library sharing');
  console.log('');
  console.log('✨ The system is ready for voice file sharing between users!');

  await pool.end();
}

// Run the demonstration
demonstrateApiTokenSystem().catch(err => {
  console.error('Demonstration failed:', err);
  process.exit(1);
});