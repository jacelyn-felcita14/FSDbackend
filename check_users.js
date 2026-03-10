const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'username role createdAt');
        console.log('\n--- Current Users in Database ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(u => {
                console.log(`- ${u.username} (${u.role}) - Created: ${u.createdAt}`);
            });
        }
        console.log('---------------------------------\n');
        process.exit(0);
    } catch (err) {
        console.error('Error connecting to DB:', err);
        process.exit(1);
    }
}

listUsers();
