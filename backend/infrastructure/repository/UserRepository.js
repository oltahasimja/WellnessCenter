
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const User = require("../database/models/User");
const UserMongo = require("../database/models/UserMongo");
const Role = require("../database/models/Role");
const RoleMongo = require("../database/models/RoleMongo");

class UserRepository {



  async getSpecialists() {
    try {

      // Merrni specialistët dhe populloni të dhënat e rolit
      const roleIds = await RoleMongo.find({ name: { $in: ['Fizioterapeut', 'Nutricionist', 'Trajner', 'Psikolog'] } }).lean();
      return await UserMongo.find({
        'roleId': { $in: roleIds.map(role => new mongoose.Types.ObjectId(role._id)) }
      }).populate('roleId').lean();
    } catch (error) {
      console.error('Gabim gjatë marrjes së specialistëve:', error);
      throw error;
    }
  }
  
  


  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await UserMongo.find().populate([{ path: 'roleId', model: 'RoleMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await User.findAll({ include: [{ model: Role }] });
    }
  }
  
  async findById(id) {
    try {
      return await UserMongo.findOne({ mysqlId: id.toString() })
        .populate('roleId')
        .lean();
    } catch (error) {
      console.error("MongoDB findById failed:", error);
      throw error;
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating User:", data);
      
      // Ensure roleId is set to 1 if not provided
      const userData = {
        ...data,
        roleId: data.roleId || 1 // Default to roleId 1 if not specified
      };

      // First create in MySQL
      const mysqlResource = await User.create(userData);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...userData
      };
      
      // Handle role - convert MySQL roleId to MongoDB reference
      const role = await RoleMongo.findOne({ mysqlId: userData.roleId.toString() });
      if (!role) {
        throw new Error(`Role with MySQL ID ${userData.roleId} not found in MongoDB`);
      }
      mongoData.roleId = new ObjectId(role._id.toString());
      
      // Create in MongoDB
      const mongoResource = await UserMongo.create(mongoData);
      console.log("User saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating User:", error);
      throw new Error('Error creating User: ' + error.message);
    }
  }

  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await User.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("User not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.roleId) {
        // Find the related document in MongoDB
        const role = await RoleMongo.findOne({ mysqlId: data.roleId.toString() });
        if (!role) {
          throw new Error(`Role with MySQL ID ${data.roleId} not found in MongoDB`);
        }
        mongoUpdateData.roleId = new ObjectId(role._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await UserMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("User not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating User:", error);
      throw new Error('Error updating User: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await User.destroy({ where: { id } });
      
      // Delete from MongoDB
      await UserMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting User:", error);
      throw new Error('Error deleting User: ' + error.message);
    }
  }
}

module.exports = new UserRepository();
