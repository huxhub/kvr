import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kvr';
  const MAX_RETRIES = 5;
  let attempt = 0;

  const tryConnect = async () => {
    attempt++;
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`🔄 Retrying in 5 seconds...`);
        setTimeout(tryConnect, 5000);
      } else {
        console.error('⚠️  Could not connect to MongoDB after multiple attempts.');
        console.error('   Update MONGO_URI in backend/.env to a valid connection string.');
        console.error('   Server is running but database operations will fail until connected.');
        // Do NOT call process.exit() — let the server stay up so it can serve a proper error response
      }
    }
  };

  await tryConnect();
};

export default connectDB;

