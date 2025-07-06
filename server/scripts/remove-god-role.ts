import mongoose from 'mongoose';
import { User } from '../src/models/user';

const AUTHORIZED_GOD_EMAILS = [
  'admin@godesk.io',
  'penningtondustin@yahoo.com'
];

const connectWithRetry = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to MongoDB (attempt ${i + 1}/${retries})...`);
      await mongoose.connect('mongodb://localhost:27017/voicevault?directConnection=true');
      console.log('Successfully connected to MongoDB');
      return true;
    } catch (error) {
      console.log(`Connection attempt ${i + 1} failed`);
      if (i < retries - 1) {
        console.log(`Waiting ${delay/1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
};

async function removeUnauthorizedGodRoles() {
  try {
    // Connect to MongoDB with retry mechanism
    await connectWithRetry();

    // Find all users with 'god' role
    const godUsers = await User.find({ role: 'god' });
    console.log(`Found ${godUsers.length} users with 'god' role`);

    // Keep track of changes
    let removedCount = 0;
    let preservedCount = 0;
    const preservedUsers: string[] = [];
    const demotedUsers: string[] = [];

    // Process each god user
    for (const user of godUsers) {
      if (!AUTHORIZED_GOD_EMAILS.includes(user.email.toLowerCase())) {
        // Remove god role from unauthorized users and set to regular user
        await User.findByIdAndUpdate(user._id, {
          $set: { role: 'user' } // Setting to regular user as per requirement
        });
        removedCount++;
        demotedUsers.push(user.email);
      } else {
        preservedCount++;
        preservedUsers.push(user.email);
      }
    }

    // Print results
    console.log('\nMigration Results:');
    console.log('------------------');
    console.log(`Total god users processed: ${godUsers.length}`);
    console.log(`God roles preserved: ${preservedCount}`);
    console.log(`God roles removed: ${removedCount}`);

    if (preservedUsers.length > 0) {
      console.log('\nPreserved god access for:');
      preservedUsers.forEach(email => console.log(`- ${email}`));
    }

    if (demotedUsers.length > 0) {
      console.log('\nRemoved god access from:');
      demotedUsers.forEach(email => console.log(`- ${email}`));
    }

    // Ensure the authorized users have god role
    for (const email of AUTHORIZED_GOD_EMAILS) {
      await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: { role: 'god' } },
        { upsert: false }
      );
    }

    console.log('\nVerified god role for authorized users');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the migration
removeUnauthorizedGodRoles(); 