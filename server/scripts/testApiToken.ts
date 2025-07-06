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

async function testApiTokenGeneration() {
  console.log('Testing API Token Generation...');
  console.log('================================');
  
  // Test token generation
  const token1 = generateApiToken();
  const token2 = generateApiToken();
  const token3 = generateApiToken();
  
  console.log(`Token 1 Length: ${token1.length} characters`);
  console.log(`Token 1: ${token1}`);
  console.log('');
  
  console.log(`Token 2 Length: ${token2.length} characters`);
  console.log(`Token 2: ${token2}`);
  console.log('');
  
  console.log(`Token 3 Length: ${token3.length} characters`);
  console.log(`Token 3: ${token3}`);
  console.log('');
  
  // Verify all tokens are unique
  const tokens = [token1, token2, token3];
  const uniqueTokens = new Set(tokens);
  console.log(`Generated ${tokens.length} tokens, ${uniqueTokens.size} unique tokens`);
  console.log(`All tokens unique: ${tokens.length === uniqueTokens.size ? 'YES' : 'NO'}`);
  console.log('');
  
  // Verify all tokens meet minimum length requirement
  const minLength = 100;
  const allMeetMinLength = tokens.every(token => token.length >= minLength);
  console.log(`All tokens >= ${minLength} characters: ${allMeetMinLength ? 'YES' : 'NO'}`);
  console.log('');
  
  // Test QR code data generation
  const qrData = {
    type: 'voicevault_library_access',
    version: '2.0',
    userId: 'test-user-123',
    userName: 'Test User',
    userEmail: 'test@example.com',
    apiToken: token1,
    accessUrl: 'http://localhost:3000/profile/test-user-123',
    timestamp: new Date().toISOString(),
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const qrDataString = JSON.stringify(qrData);
  const qrDataEncoded = encodeURIComponent(qrDataString);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${qrDataEncoded}&color=1976d2&bgcolor=ffffff&ecc=H&margin=2`;
  
  console.log('QR Code Data:');
  console.log(qrDataString);
  console.log('');
  console.log('QR Code URL:');
  console.log(qrCodeUrl);
  console.log('');
  
  // Test database connection and token storage
  let client;
  try {
    console.log('Testing database connection...');
    client = await pool.connect();
    console.log('Database connected successfully!');
    
    // Check if we can query users table
    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`Users in database: ${result.rows[0].user_count}`);
    
    // Test updating a user's API token
    const updateResult = await client.query(
      'UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING id, first_name, last_name, email',
      [token1]
    );
    
    if (updateResult.rows.length > 0) {
      const user = updateResult.rows[0];
      console.log(`Updated API token for user: ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`New token length: ${token1.length} characters`);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
  
  console.log('');
  console.log('API Token Test Complete!');
  console.log('========================');
}

// Run the test
testApiTokenGeneration().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});