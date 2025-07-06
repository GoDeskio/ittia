import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { generateApiToken } from '../src/utils/tokenGenerator';

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

async function createAdminTester() {
  console.log('Starting Admin Tester creation process...');
  
  let client;
  try {
    // Try to connect to the database
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Successfully connected to database!');
    
    // Start a transaction
    console.log('Starting database transaction...');
    await client.query('BEGIN');
    
    // Check if the users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating users table as it does not exist...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          password_hash VARCHAR(255) NOT NULL,
          api_token TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    // Check if user already exists
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', ['Admin@godesk.io']);
    
    if (userCheck.rows.length > 0) {
      console.log('User with email Admin@godesk.io already exists.');
      console.log('Updating user details...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('K24a4_rb26', salt);
      
      // Generate secure API token (100+ characters)
      const apiToken = generateApiToken();
      
      // Update the existing user
      await client.query(`
        UPDATE users 
        SET first_name = $1, last_name = $2, phone = $3, password_hash = $4, api_token = $5, is_admin = $6, updated_at = CURRENT_TIMESTAMP
        WHERE email = $7
      `, ['Admin', 'Tester', '480-818-3461', passwordHash, apiToken, true, 'Admin@godesk.io']);
      
      console.log('User updated successfully!');
    } else {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('K24a4_rb26', salt);
      
      // Generate secure API token (100+ characters)
      const apiToken = generateApiToken();
      
      // Insert the new user
      await client.query(`
        INSERT INTO users (first_name, last_name, email, phone, password_hash, api_token, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['Admin', 'Tester', 'Admin@godesk.io', '480-818-3461', passwordHash, apiToken, true]);
      
      console.log('User created successfully!');
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    // Retrieve and display the user details
    const user = await client.query('SELECT id, first_name, last_name, email, phone, api_token, is_admin FROM users WHERE email = $1', ['Admin@godesk.io']);
    
    console.log('\nTest Profile Account Details:');
    console.log('----------------------------');
    console.log(`ID: ${user.rows[0].id}`);
    console.log(`Name: ${user.rows[0].first_name} ${user.rows[0].last_name}`);
    console.log(`Email: ${user.rows[0].email}`);
    console.log(`Phone: ${user.rows[0].phone}`);
    console.log(`Admin: ${user.rows[0].is_admin ? 'Yes' : 'No'}`);
    console.log(`API Token: ${user.rows[0].api_token}`);
    console.log(`Password: K24a4_rb26 (stored as hashed value)`);
    console.log('----------------------------');
    
  } catch (error) {
    console.error('Error creating/updating test user:', error);
    
    // Rollback the transaction in case of error
    if (client) {
      try {
        console.log('Rolling back transaction...');
        await client.query('ROLLBACK');
        console.log('Transaction rolled back successfully');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
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
createAdminTester().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});