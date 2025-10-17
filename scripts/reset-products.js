// Drop and recreate the products collection with new schema
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/wandenreich';

async function resetProductCollection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;
    
    // Check if collection exists
    const collections = await db.listCollections({ name: 'productsimples' }).toArray();
    
    if (collections.length > 0) {
      console.log('Dropping existing productsimples collection...');
      await db.collection('productsimples').drop();
      console.log('Collection dropped!');
    } else {
      console.log('Collection does not exist yet.');
    }

    console.log('Collection reset complete! You can now create products with the new schema.');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetProductCollection();
