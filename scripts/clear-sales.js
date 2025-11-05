const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.*)/)[1].trim();

const SaleSchema = new mongoose.Schema({}, { strict: false });
const Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);

async function clearSales() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Sale.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} sales`);

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearSales();
