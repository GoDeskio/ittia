import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkDatabase() {
  console.log('Checking database connection...');
  
  // First, try to connect to PostgreSQL server
  const serverPool = new Pool({
    connectionString: process.env.DATABASE_URL?.replace(/\/voicevault$/, '/postgres') || 
                     'postgresql://postgres:postgres@localhost:5432/postgres',
  });
  
  try {
    // Check if PostgreSQL server is running
    const client = await serverPool.connect();
    console.log('✅ Successfully connected to PostgreSQL server');
    
    // Check if voicevault database exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_database WHERE datname = 'voicevault'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log('❌ Database "voicevault" does not exist');
      console.log('Creating database "voicevault"...');
      
      // Create the database
      await client.query('CREATE DATABASE voicevault');
      console.log('✅ Database "voicevault" created successfully');
    } else {
      console.log('✅ Database "voicevault" already exists');
    }
    
    client.release();
    await serverPool.end();
    
    // Now try to connect to the voicevault database
    const appPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voicevault',
    });
    
    const appClient = await appPool.connect();
    console.log('✅ Successfully connected to "voicevault" database');
    appClient.release();
    await appPool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Run the function
checkDatabase().then(success => {
  if (success) {
    console.log('✅ Database check completed successfully');
    process.exit(0);
  } else {
    console.error('❌ Database check failed');
    console.log('\nPossible solutions:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Check that the database credentials in .env are correct');
    console.log('3. Ensure the PostgreSQL user has permission to create databases');
    process.exit(1);
  }
});