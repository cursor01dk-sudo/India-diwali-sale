const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/userModel');

dotenv.config({ path: path.join(__dirname, '../config/config.env') });

const [,, emailArg, passwordArg, nameArg] = process.argv;

mongoose.set('strictQuery', false);

async function run() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flipkart';
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB.');

        if (!emailArg || !passwordArg) {
            console.log('\n--- Current Registered Admin Accounts ---');
            const admins = await User.find({ role: 'admin' }, { name: 1, email: 1, role: 1 });
            if (admins.length === 0) {
                console.log('No admin accounts found.');
            } else {
                admins.forEach((a, i) => {
                    console.log(`[${i + 1}] Name: ${a.name} | Email: ${a.email} | Role: ${a.role}`);
                });
            }
            console.log('\nUsage to update or create an admin account:');
            console.log('node backend/utils/setAdminCredentials.js <admin-email> <new-password> [admin-name]\n');
            process.exit(0);
        }

        const email = emailArg.trim().toLowerCase();
        const password = passwordArg;
        const name = nameArg ? nameArg.trim() : 'Store Administrator';

        let admin = await User.findOne({ email });
        if (admin) {
            admin.password = password;
            admin.role = 'admin';
            if (nameArg) admin.name = name;
            await admin.save();
            console.log(`\n SUCCESS: Admin account updated for [${email}] with your new secure password!`);
        } else {
            admin = await User.create({
                name,
                email,
                password,
                gender: 'male',
                role: 'admin',
                avatar: {
                    public_id: 'admin_avatar',
                    url: 'https://rukminim1.flixcart.com/www/100/100/promos/01/07/2019/335606d2-6421-4d37-8339-ff741b65df02.png'
                }
            });
            console.log(`\n SUCCESS: New Admin account created for [${email}] with secure password!`);
        }

        process.exit(0);
    } catch (err) {
        console.error(' Error setting admin credentials:', err.message);
        process.exit(1);
    }
}

run();
