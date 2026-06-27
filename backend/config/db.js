const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Provide your MongoDB Atlas connection string.');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new Error(`Cannot reach MongoDB Atlas (${error.message}). Check URI, internet, DNS, and Atlas Network Access allowlist.`);
    }
    throw error;
  }
};

module.exports = connectDB;
