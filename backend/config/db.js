const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nestora_db');
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Don't exit process so developers without Mongo running can still start the server and use in-memory/mock fallback
    console.warn('[MongoDB Warning]: Server will continue running, but DB queries will fail until MongoDB is started.');
  }
};

module.exports = connectDB;
