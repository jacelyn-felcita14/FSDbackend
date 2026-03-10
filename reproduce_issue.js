const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function reproduce() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const newUsername = 'testuser_' + Date.now();
        console.log(`Attempting to register new user: ${newUsername}`);

        const user = new User({
            username: newUsername,
            password: 'password123',
            role: 'REQUESTER'
        });

        try {
            await user.save();
            console.log('User registered successfully');
        } catch (error) {
            console.error('Error during save:');
            console.error('Code:', error.code);
            console.error('Message:', error.message);
            console.error('Full Error:', JSON.stringify(error, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error connecting to DB:', err);
        process.exit(1);
    }
}

reproduce();
