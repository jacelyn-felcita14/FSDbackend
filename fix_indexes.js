const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('\nCurrent indexes:');
        indexes.forEach(idx => {
            console.log(`- ${idx.name}:`, idx.key);
        });

        // Check if email_1 index exists
        const emailIndex = indexes.find(idx => idx.name === 'email_1');

        if (emailIndex) {
            console.log('\nDropping stale email_1 index...');
            await collection.dropIndex('email_1');
            console.log('✓ Successfully dropped email_1 index');
        } else {
            console.log('\nNo email_1 index found (already clean)');
        }

        // Verify remaining indexes
        const remainingIndexes = await collection.indexes();
        console.log('\nRemaining indexes:');
        remainingIndexes.forEach(idx => {
            console.log(`- ${idx.name}:`, idx.key);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixIndexes();
