
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;


const { UserMongo, CartItemMongo } = require('../database/models/indexMongo');

const { Users, CartItem } = require('../database/models/index');


class CartItemRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await CartItemMongo.find().populate([{ path: 'userId', model: 'UserMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await CartItem.findAll({ include: [{ model: Users }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await CartItemMongo.findOne({ mysqlId: id }).populate([{ path: 'userId', model: 'UserMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await CartItem.findByPk(id, { include: [{ model: Users }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
  try {
    console.log("Creating CartItem:", data);

    // 1. Ruaj në MySQL
    const mysqlResource = await CartItem.create(data);

    // 2. Gjej user-in në MongoDB
const users = await UserMongo.findOne({ mysqlId: data.userId.toString() });
    if (!users) {
      throw new Error(`Users with MySQL ID ${data.usersId} not found in MongoDB`);
    }

    // 3. Përgatit të dhënat për MongoDB
    const mongoData = {
      mysqlId: mysqlResource.id.toString(),
      userId: users._id,
      productId: data.productId,
      name: data.name,
      image: data.image,
      price: data.price,
      quantity: data.quantity,
    };

    // 4. Gjej ose krijo Cart në MongoDB
    const existingCart = await CartItemMongo.findOne({ userId: users._id });

    if (existingCart) {
      existingCart.items.push({
        productId: mongoData.productId,
        name: mongoData.name,
        image: mongoData.image,
        price: mongoData.price,
        quantity: mongoData.quantity,
      });
      await existingCart.save();
      console.log("Cart updated in MongoDB:", existingCart);
    } else {
      const newCart = await CartItemMongo.create({
        userId: mongoData.userId,
        items: [mongoData],
      });
      console.log("Cart created in MongoDB:", newCart);
    }

    return mysqlResource;

  } catch (error) {
    console.error("Error creating CartItem:", error);
    throw new Error('Error creating CartItem: ' + error.message);
  }
}

  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await CartItem.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("CartItem not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.usersId) {
        // Find the related document in MongoDB
        const users = await UsersMongo.findOne({ mysqlId: data.usersId.toString() });
        if (!users) {
          throw new Error(`Users with MySQL ID ${data.usersId} not found in MongoDB`);
        }
        mongoUpdateData.usersId = new ObjectId(users._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await CartItemMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("CartItem not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating CartItem:", error);
      throw new Error('Error updating CartItem: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await CartItem.destroy({ where: { id } });
      
      // Delete from MongoDB
      await CartItemMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting CartItem:", error);
      throw new Error('Error deleting CartItem: ' + error.message);
    }
  }
  async updateMongoOnlyByUserId(userMysqlId, newItemsArray) {
  const user = await UserMongo.findOne({ mysqlId: userMysqlId.toString() });
  if (!user) throw new Error("User not found in MongoDB");

  const updated = await CartItemMongo.updateOne(
    { userId: user._id },
    { $set: { items: newItemsArray } }
  );

  if (updated.modifiedCount === 0) {
    throw new Error("Nothing was updated in MongoDB");
  }

  return await CartItemMongo.findOne({ userId: user._id });
}

}



module.exports = new CartItemRepository();
