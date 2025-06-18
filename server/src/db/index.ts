import { Pool } from 'pg';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

// Create a new pool using the configuration
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Initialize database schema
async function initializeDatabase() {
  try {
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL');
    client.release();
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    throw error;
  }
}

// Export the pool and initialization functions
export {
  pool,
  initializeDatabase,
  testConnection
}; 