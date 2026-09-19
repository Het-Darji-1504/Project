const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Property = require('../models/Property');
const Roommate = require('../models/Roommate');
const Expense = require('../models/Expense');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const OwnerProperty = require('../models/OwnerProperty');
const AgreementClause = require('../models/AgreementClause');

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8'));

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nestora_db';
    console.log(`[Connecting to MongoDB]: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Clearing existing records]...');
    await Property.deleteMany({});
    await Roommate.deleteMany({});
    await Expense.deleteMany({});
    await Ticket.deleteMany({});
    await Notification.deleteMany({});
    await OwnerProperty.deleteMany({});
    await AgreementClause.deleteMany({});

    console.log('[Inserting Properties]...');
    await Property.insertMany(rawData.properties);

    console.log('[Inserting Roommates]...');
    await Roommate.insertMany(rawData.roommates);

    console.log('[Inserting Shared Expenses]...');
    await Expense.insertMany(rawData.sharedExpenses);

    console.log('[Inserting Maintenance Tickets]...');
    await Ticket.insertMany(rawData.maintenanceTickets);

    console.log('[Inserting Notifications]...');
    await Notification.insertMany(rawData.notifications);

    console.log('[Inserting Owner Properties]...');
    await OwnerProperty.insertMany(rawData.ownerData.properties);

    console.log('[Inserting Agreement Clauses]...');
    await AgreementClause.insertMany(rawData.plainEnglishAgreementClauses);

    console.log('✅ [Database Seed Completed Successfully!]');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Database Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
