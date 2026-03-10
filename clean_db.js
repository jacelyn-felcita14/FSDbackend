const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function cleanDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await User.deleteMany({ username: { $in: [null, 'undefined', ''] } });
        console.log(`\nDeleted ${result.deletedCount} invalid users.\n`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

cleanDB();
