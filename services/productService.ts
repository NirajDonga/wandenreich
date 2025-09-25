import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';
import ProductVariant, { IProductVariant } from '../models/ProductVariant';
import UnitOfMeasure, { IUnitOfMeasure } from '../models/UnitOfMeasure';
import Inventory, { IInventory } from '../models/Inventory';
import InventoryTransaction, { IInventoryTransaction } from '../models/InventoryTransaction';

// Unit of Measure Functions
export async function createUnitOfMeasure(name: string, abbreviation: string): Promise<IUnitOfMeasure> {
  try {
    const unitOfMeasure = new UnitOfMeasure({
      name,
      abbreviation
    });
    
    return await unitOfMeasure.save();
  } catch (error: any) {
    throw new Error(`Failed to create unit of measure: ${error.message}`);
  }
}

export async function getAllUnitsOfMeasure(): Promise<IUnitOfMeasure[]> {
  try {
    return await UnitOfMeasure.find().sort({ name: 1 });
  } catch (error: any) {
    throw new Error(`Failed to fetch units of measure: ${error.message}`);
  }
}

// Product Functions
export async function createProduct(
  name: string, 
  sku: string, 
  unitOfMeasureId: string
): Promise<IProduct> {
  try {
    // Verify unit of measure exists
    const unitExists = await UnitOfMeasure.exists({ _id: unitOfMeasureId });
    if (!unitExists) {
      throw new Error('Unit of measure not found');
    }

    // Check if SKU is already in use
    const skuExists = await Product.exists({ sku: sku.toUpperCase() });
    if (skuExists) {
      throw new Error('SKU already in use');
    }

    const product = new Product({
      name: name.toUpperCase(), // Always capitalize
      sku: sku.toUpperCase(), // Always capitalize
      unitOfMeasureId
    });
    
    return await product.save();
  } catch (error: any) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

// Complete product creation with all fields
export async function createCompleteProduct(productData: {
  name: string;
  brand?: string;
  unitOfMeasure: string;
  description?: string;
  sellingPrice?: number;
  costPrice?: number;
  barcode?: string;
  sku?: string;
  minStockLevel?: number;
  isActive?: boolean;
}): Promise<any> {
  try {
    // Verify unit of measure exists
    const unitExists = await UnitOfMeasure.exists({ _id: productData.unitOfMeasure });
    if (!unitExists) {
      throw new Error('Unit of measure not found');
    }

    // Check if SKU is already in use (if provided)
    if (productData.sku) {
      const skuExists = await Product.exists({ sku: productData.sku.toUpperCase() });
      if (skuExists) {
        throw new Error('SKU already in use');
      }
    }

    const product = new Product({
      name: productData.name.toUpperCase(), // Always capitalize
      sku: productData.sku?.toUpperCase() || `AUTO-${Date.now()}`,
      brand: productData.brand?.toUpperCase() || '',
      description: productData.description || '',
      unitOfMeasure: productData.unitOfMeasure,
      sellingPrice: productData.sellingPrice || 0,
      costPrice: productData.costPrice || 0,
      barcode: productData.barcode || '',
      minStockLevel: productData.minStockLevel || 10,
      isActive: productData.isActive !== false
    });
    
    const savedProduct = await product.save();
    
    // Return populated product
    return await Product.findById(savedProduct._id)
      .populate('unitOfMeasure');
  } catch (error: any) {
    throw new Error(`Failed to create complete product: ${error.message}`);
  }
}

export async function getProductById(productId: string): Promise<IProduct> {
  try {
    const product = await Product.findById(productId).populate('unitOfMeasureId');
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  } catch (error: any) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
}

export async function getAllProducts(): Promise<IProduct[]> {
  try {
    return await Product.find().populate('unitOfMeasure').sort({ name: 1 });
  } catch (error: any) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}

// Product Variant Functions
export async function createProductVariant(
  productId: string,
  name: string,
  sku: string,
  attributes: Record<string, any>,
  sellingPrice: number
): Promise<IProductVariant> {
  try {
    // Verify product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      throw new Error('Product not found');
    }

    // Check if SKU is already in use
    const skuExists = await ProductVariant.exists({ sku });
    if (skuExists) {
      throw new Error('SKU already in use');
    }

    const productVariant = new ProductVariant({
      productId,
      name,
      sku,
      attributes,
      sellingPrice
    });
    
    const savedVariant = await productVariant.save();
    
    // Create initial inventory record with zero quantity
    await Inventory.create({
      productVariantId: savedVariant._id,
      quantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0
    });
    
    return savedVariant;
  } catch (error: any) {
    throw new Error(`Failed to create product variant: ${error.message}`);
  }
}

export async function getVariantsByProductId(productId: string): Promise<IProductVariant[]> {
  try {
    return await ProductVariant.find({ productId }).sort({ name: 1 });
  } catch (error: any) {
    throw new Error(`Failed to fetch product variants: ${error.message}`);
  }
}

// Inventory Functions
export async function updateInventoryLevels(
  productVariantId: string,
  minStockLevel: number,
  maxStockLevel: number
): Promise<IInventory> {
  try {
    const inventory = await Inventory.findOne({ productVariantId });
    if (!inventory) {
      throw new Error('Inventory record not found');
    }
    
    inventory.minStockLevel = minStockLevel;
    inventory.maxStockLevel = maxStockLevel;
    inventory.lastUpdated = new Date();
    
    return await inventory.save();
  } catch (error: any) {
    throw new Error(`Failed to update inventory levels: ${error.message}`);
  }
}

export async function getInventoryByVariantId(productVariantId: string): Promise<IInventory> {
  try {
    const inventory = await Inventory.findOne({ productVariantId }).populate({
      path: 'productVariantId',
      populate: {
        path: 'productId'
      }
    });
    
    if (!inventory) {
      throw new Error('Inventory not found');
    }
    
    return inventory;
  } catch (error: any) {
    throw new Error(`Failed to fetch inventory: ${error.message}`);
  }
}

export async function getAllInventory(): Promise<IInventory[]> {
  try {
    return await Inventory.find().populate({
      path: 'productVariantId',
      populate: {
        path: 'productId'
      }
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch inventory: ${error.message}`);
  }
}

export async function getLowStockItems(): Promise<IInventory[]> {
  try {
    return await Inventory.find({
      $expr: {
        $lt: ['$quantity', '$minStockLevel']
      }
    }).populate({
      path: 'productVariantId',
      populate: {
        path: 'productId'
      }
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch low stock items: ${error.message}`);
  }
}

export async function getOverstockItems(): Promise<IInventory[]> {
  try {
    return await Inventory.find({
      maxStockLevel: { $gt: 0 }, // Ensure max stock level is set
      $expr: {
        $gt: ['$quantity', '$maxStockLevel']
      }
    }).populate({
      path: 'productVariantId',
      populate: {
        path: 'productId'
      }
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch overstock items: ${error.message}`);
  }
}

// Inventory Transaction Functions
export async function createInventoryTransaction(
  productVariantId: string,
  transactionType: 'purchase' | 'sale' | 'return' | 'adjustment',
  quantity: number,
  purchaseOrderItemId?: string,
  salesOrderItemId?: string,
  notes?: string
): Promise<IInventoryTransaction> {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create transaction record
    const transaction = new InventoryTransaction({
      productVariantId,
      transactionType,
      quantity,
      purchaseOrderItemId,
      salesOrderItemId,
      notes
    });
    
    await transaction.save({ session });
    
    // Update inventory quantity
    const inventory = await Inventory.findOne({ productVariantId }).session(session);
    if (!inventory) {
      throw new Error('Inventory record not found');
    }
    
    // Apply quantity changes based on transaction type
    switch (transactionType) {
      case 'purchase':
      case 'return':
        // These transactions add to inventory
        inventory.quantity += quantity;
        break;
      case 'sale':
        // Sales reduce inventory
        if (inventory.quantity < quantity) {
          throw new Error('Insufficient inventory');
        }
        inventory.quantity -= quantity;
        break;
      case 'adjustment':
        // Adjustments can be positive or negative
        inventory.quantity += quantity; // quantity can be negative
        if (inventory.quantity < 0) {
          throw new Error('Adjustment would result in negative inventory');
        }
        break;
    }
    
    inventory.lastUpdated = new Date();
    await inventory.save({ session });
    
    await session.commitTransaction();
    return transaction;
  } catch (error: any) {
    await session.abortTransaction();
    throw new Error(`Inventory transaction failed: ${error.message}`);
  } finally {
    session.endSession();
  }
}

export async function getInventoryTransactionsByVariant(
  productVariantId: string,
  startDate?: Date,
  endDate?: Date
): Promise<IInventoryTransaction[]> {
  try {
    const query: any = { productVariantId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }
    
    return await InventoryTransaction.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .populate('productVariantId');
  } catch (error: any) {
    throw new Error(`Failed to fetch inventory transactions: ${error.message}`);
  }
}

// Manual Stock Adjustment
export async function adjustInventory(
  productVariantId: string, 
  quantityChange: number, 
  notes: string
): Promise<IInventory> {
  try {
    await createInventoryTransaction(
      productVariantId,
      'adjustment',
      quantityChange,
      undefined,
      undefined,
      notes
    );
    
    return await getInventoryByVariantId(productVariantId);
  } catch (error: any) {
    throw new Error(`Failed to adjust inventory: ${error.message}`);
  }
}