import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voicevault',
});

// Log connection information (without sensitive details)
console.log('Attempting to connect to database...');
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voicevault';
const maskedConnectionString = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log(`Using connection string: ${maskedConnectionString}`);

async function listUsers() {
  console.log('Starting user listing process...');
  
  let client;
  try {
    // Try to connect to the database
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Successfully connected to database!');
    
    // Check if the users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Users table does not exist. No users have been created yet.');
      return;
    }
    
    // First, check what columns exist in the users table
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Available columns in users table:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    console.log('');
    
    // Check if we have the old schema (first_name, last_name) or new schema (just email)
    const hasFirstName = columnsResult.rows.some(col => col.column_name === 'first_name');
    
    let query;
    if (hasFirstName) {
      // Old schema with first_name, last_name, is_admin
      query = `
        SELECT id, first_name, last_name, email, phone, is_admin, api_token, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
      `;
    } else {
      // New schema with just email and role
      query = `
        SELECT id, email, role, api_token, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
      `;
    }
    
    // Get all users from the database
    const usersResult = await client.query(query);
    
    if (usersResult.rows.length === 0) {
      console.log('No users found in the database.');
      return;
    }
    
    console.log('\n=== VoiceVault Users ===');
    console.log(`Total users: ${usersResult.rows.length}`);
    console.log('========================\n');
    
    usersResult.rows.forEach((user, index) => {
      console.log(`User #${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      
      if (user.first_name && user.last_name) {
        console.log(`  Name: ${user.first_name} ${user.last_name}`);
      }
      
      console.log(`  Email: ${user.email}`);
      
      if (user.phone) {
        console.log(`  Phone: ${user.phone}`);
      }
      
      if (user.is_admin !== undefined) {
        console.log(`  Admin: ${user.is_admin ? 'Yes' : 'No'}`);
      } else if (user.role) {
        console.log(`  Role: ${user.role}`);
      }
      
      if (user.api_token) {
        console.log(`  API Token: ${user.api_token.substring(0, 20)}...`);
      }
      
      console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`  Updated: ${new Date(user.updated_at).toLocaleString()}`);
      console.log('  ---');
    });
    
    // Summary statistics
    let adminCount = 0;
    if (usersResult.rows.length > 0) {
      if (usersResult.rows[0].is_admin !== undefined) {
        adminCount = usersResult.rows.filter(user => user.is_admin).length;
      } else if (usersResult.rows[0].role !== undefined) {
        adminCount = usersResult.rows.filter(user => user.role === 'admin').length;
      }
    }
    const regularCount = usersResult.rows.length - adminCount;
    
    console.log('\n=== Summary ===');
    console.log(`Total Users: ${usersResult.rows.length}`);
    console.log(`Admin Users: ${adminCount}`);
    console.log(`Regular Users: ${regularCount}`);
    console.log('===============\n');
    
  } catch (error) {
    console.error('Error listing users:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nDatabase connection refused. Please ensure:');
      console.error('1. PostgreSQL is running');
      console.error('2. Database connection settings are correct');
      console.error('3. Database exists and is accessible');
    } else if (error.code === '42P01') {
      console.error('\nUsers table does not exist. This might mean:');
      console.error('1. Database migrations have not been run');
      console.error('2. No users have been created yet');
    }
  } finally {
    // Release the client back to the pool
    if (client) {
      try {
        console.log('Releasing database connection...');
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    // Close the pool
    try {
      console.log('Closing database connection pool...');
      await pool.end();
      console.log('Database connection pool closed successfully');
    } catch (poolError) {
      console.error('Error closing pool:', poolError);
    }
  }
}

// Run the function
listUsers().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});