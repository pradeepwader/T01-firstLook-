const mongoose = require("mongoose");
const env = require("./env");

module.exports = async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[T01] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`[T01] MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};
