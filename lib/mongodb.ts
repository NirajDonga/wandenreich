import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wandenreich';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Track the connection state
const connectionState = {
  isConnected: false,
};

async function connectDB() {
  // If already connected, return
  if (connectionState.isConnected) {
    return;
  }

  // Connect to database
  try {
    const db = await mongoose.connect(MONGODB_URI);
    connectionState.isConnected = db.connections[0].readyState === 1;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB;