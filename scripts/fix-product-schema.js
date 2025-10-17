// Run this script to remove old fields from existing products
// Usage: node scripts/fix-product-schema.js

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/wandenreich';

async function fixProductSchema() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('productsimples');

    // Remove the old fields from all existing products
    console.log('Removing old fields (sellingPrice, maxStockLevel)...');
    const result = await productsCollection.updateMany(
      {},
      {
        $unset: {
          sellingPrice: "",
          maxStockLevel: ""
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} products`);
    console.log('Schema fix complete!');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing schema:', error);
    process.exit(1);
  }
}

fixProductSchema();
