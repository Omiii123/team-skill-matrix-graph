// Connects to MongoDB using Mongoose. Reads MONGO_URI from environment.
const mongoose = require('mongoose');

const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/team_skill_matrix';

     console.log('Connecting to:', uri); 

    await mongoose.connect(uri,{ serverSelectionTimeoutMS: 5000,family: 4 ,});
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
