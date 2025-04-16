
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongoose').Types;
const User = require("../database/models/User");
const UserMongo = require("../database/models/UserMongo");
const Role = require("../database/models/Role");
const RoleMongo = require("../database/models/RoleMongo");
const Country = require("../database/models/Country");
const CountryMongo = require("../database/models/CountryMongo");
const City = require("../database/models/City");
const CityMongo = require("../database/models/CityMongo");
const ProfileImage = require("../database/models/ProfileImage");
const ProfileImageMongo = require("../database/models/ProfileImageMongo");
const DashboardRole = require("../database/models/DashboardRole");
const DashboardRoleMongo = require("../database/models/DashboardRoleMongo");

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
        return await UserMongo.find()
            .populate('roleId')
            .populate('countryId')
            .populate('cityId')
            .populate('dashboardRoleId')
            .populate('profileImageId')
            // .populate({
            //   path: 'profileImageId',
            //   select: 'id name'  
            // })
            .lean();
    } catch (error) {
        console.error("MongoDB findAll failed:", error);
        throw error;
    }
}
  
async findById(id) {
  try {
    const user = await UserMongo.findOne({ mysqlId: id.toString() })
      .populate('roleId')
      .populate('countryId')
      .populate('cityId')
      .populate('dashboardRoleId')
      .populate({
        path: 'profileImageId',
        select: 'name'  // Sigurohu që po kthen vetëm fushën 'name'
      })
      .lean();

    // Nëse profileImageId është objekt, kthe vetëm të dhënat e imazhit
    if (user?.profileImageId) {
      user.profileImageId = user.profileImageId.name;
    }

    return user;
  } catch (error) {
    console.error("MongoDB findById failed:", error);
    throw error;
  }
}
async create(data) {
  try {
      console.log("Creating User:", data);
      
      const userData = {
          ...data,
          roleId: data.roleId || 1
      };

      let profileImageRecord;

      if (userData.profileImageRecord) {
          [profileImageRecord] = await ProfileImage.findOrCreate({
              where: { name: userData.profileImage }
          });
          userData.profileImageId = profileImageRecord.id;
      }

      let countryRecord, cityRecord;
      
      if (userData.country) {
          [countryRecord] = await Country.findOrCreate({
              where: { name: userData.country }
          });
          userData.countryId = countryRecord.id;
      }

      if (userData.city && countryRecord) {
          [cityRecord] = await City.findOrCreate({
              where: { 
                  name: userData.city,
                  countryId: countryRecord.id
              }
          });
          userData.cityId = cityRecord.id;
      }

      // Create in MySQL
      const mysqlResource = await User.create(userData);
      
      // Prepare data for MongoDB
      const mongoData = {
          mysqlId: mysqlResource.id.toString(),
          ...userData
      };
      
      // Handle role
      const role = await RoleMongo.findOne({ mysqlId: userData.roleId.toString() });
      if (!role) {
          throw new Error(`Role with MySQL ID ${userData.roleId} not found in MongoDB`);
      }
      mongoData.roleId = new ObjectId(role._id.toString());
      
      // Handle country for MongoDB
      if (countryRecord) {
          let countryMongo = await CountryMongo.findOne({ mysqlId: countryRecord.id.toString() });
          if (!countryMongo) {
              countryMongo = await CountryMongo.create({
                  mysqlId: countryRecord.id.toString(),
                  name: countryRecord.name
              });
          }
          mongoData.countryId = countryMongo._id;
      }

      // Handle city for MongoDB
      if (cityRecord) {
          let cityMongo = await CityMongo.findOne({ mysqlId: cityRecord.id.toString() });
          if (!cityMongo) {
              cityMongo = await CityMongo.create({
                  mysqlId: cityRecord.id.toString(),
                  name: cityRecord.name,
                  countryId: mongoData.countryId
              });
          }
          mongoData.cityId = cityMongo._id;
      }

      // Handle profile image for MongoDB
      if (profileImageRecord) {
          let profileImageMongo = await ProfileImageMongo.findOne({ 
              mysqlId: profileImageRecord.id.toString() 
          });
          
          if (!profileImageMongo) {
              profileImageMongo = await ProfileImageMongo.create({
                  mysqlId: profileImageRecord.id.toString(),
                  name: profileImageRecord.name
              });
          }
          
          mongoData.profileImageId = profileImageMongo._id;
      }
      
      // Create in MongoDB
      const mongoResource = await UserMongo.create(mongoData);
      console.log("User saved in MongoDB:", mongoResource);
      
      return mysqlResource;
  } catch (error) {
      console.error("Error creating User:", error);
      throw new Error('Error creating User: ' + error.message);
  }
}

  
// Në UserRepository, përditësoni metodën update
async update(id, data) {
  try {
    const mysqlUser = await User.findByPk(id, {
      include: [Country, City, ProfileImage, DashboardRole]
    });

    if (!mysqlUser) {
      throw new Error("User not found in MySQL");
    }
    if (data.dashboardRoleId !== undefined) {
      await mysqlUser.setDashboardRole(data.dashboardRoleId);
    }


    await mysqlUser.update({
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      roleId: data.roleId,
      dashboardRoleId: data.dashboardRoleId,
      birthday: data.birthday,
      gender: data.gender,
      number: data.number
    });

    if (data.country) {
      let country = await Country.findOne({ where: { name: data.country } });
      if (!country) country = await Country.create({ name: data.country });
      await mysqlUser.setCountry(country);
    }

    if (data.city && data.country) {
      let country = await Country.findOne({ where: { name: data.country } });
      let city = await City.findOne({ where: { name: data.city, countryId: country.id } });
      if (!city) city = await City.create({ name: data.city, countryId: country.id });
      await mysqlUser.setCity(city);
    }

    if (data.profileImage !== undefined) {
      if (data.profileImage === null) {
        if (mysqlUser.ProfileImage) {
          await mysqlUser.ProfileImage.destroy();
        }
        await mysqlUser.setProfileImage(null);
      } else {
        let profileImageRecord;
        
        if (mysqlUser.ProfileImage) {
          profileImageRecord = await ProfileImage.findByPk(mysqlUser.ProfileImage.id);
          await profileImageRecord.update({ name: data.profileImage });
        } else {
          profileImageRecord = await ProfileImage.create({ 
            name: data.profileImage,
            userId: id
          });
        }
        
        await mysqlUser.setProfileImage(profileImageRecord);
      }
    }

    const mongoUpdateData = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      roleId: data.roleId,
      dashboardRoleId: data.dashboardRoleId,
     birthday: data.birthday,
      gender: data.gender,
      number: data.number
    };

    if (mysqlUser.Country) {
      let countryMongo = await CountryMongo.findOne({ mysqlId: mysqlUser.Country.id.toString() });
      if (!countryMongo) {
        countryMongo = await CountryMongo.create({
          mysqlId: mysqlUser.Country.id.toString(),
          name: mysqlUser.Country.name
        });
      }
      mongoUpdateData.countryId = countryMongo._id;
    }

    if (mysqlUser.City) {
      let cityMongo = await CityMongo.findOne({ mysqlId: mysqlUser.City.id.toString() });
      if (!cityMongo) {
        cityMongo = await CityMongo.create({
          mysqlId: mysqlUser.City.id.toString(),
          name: mysqlUser.City.name,
          countryId: mongoUpdateData.countryId
        });
      }
      mongoUpdateData.cityId = cityMongo._id;
    }

    // Përditëso referencën e imazhit në MongoDB
    if (mysqlUser.ProfileImage) {
      let profileImageMongo = await ProfileImageMongo.findOne({ 
        mysqlId: mysqlUser.ProfileImage.id.toString() 
      });
      
      if (!profileImageMongo) {
        profileImageMongo = await ProfileImageMongo.create({
          mysqlId: mysqlUser.ProfileImage.id.toString(),
          name: mysqlUser.ProfileImage.name
        });
      }
      mongoUpdateData.profileImageId = profileImageMongo._id;
    } else {
      mongoUpdateData.profileImageId = null;
    }

        if (data.roleId) {
            // Find the related document in MongoDB
            const role = await RoleMongo.findOne({ mysqlId: data.roleId.toString() });
            if (!role) {
              throw new Error(`Role with MySQL ID ${data.roleId} not found in MongoDB`);
            }
            mongoUpdateData.roleId = new ObjectId(role._id.toString());
          }

          if (data.dashboardRoleId) {
            // Find the related document in MongoDB
            const role = await DashboardRoleMongo.findOne({ mysqlId: data.dashboardRoleId.toString() });
            if (!role) {
              throw new Error(`Role with MySQL ID ${data.dashboardRoleId} not found in MongoDB`);
            }
            mongoUpdateData.dashboardRoleId = new ObjectId(role._id.toString());
          }

    await UserMongo.updateOne(
      { mysqlId: id.toString() },
      { $set: mongoUpdateData }
    );

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


  async findByRole(roleId) {
    try {
      const role = await RoleMongo.findOne({ mysqlId: roleId.toString() });
      if (!role) {
        throw new Error(`Role with ID ${roleId} not found`);
      }
      
      return await UserMongo.find({ roleId: role._id })
        .populate('roleId')
        .lean();
    } catch (error) {
      console.error("Error finding users by role:", error);
      throw error;
    }
  }

  // In UserRepository class
async updatePassword(id, currentPassword, newPassword) {
  try {
    // 1. Find user in MongoDB (for password verification)
    const mongoUser = await UserMongo.findOne({ mysqlId: id.toString() });
    if (!mongoUser) {
      throw new Error("User not found");
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, mongoUser.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password in MySQL
    const mysqlUser = await User.findByPk(id);
    if (!mysqlUser) {
      throw new Error("MySQL user not found");
    }
    await mysqlUser.update({ password: hashedPassword });

    // 5. Update password in MongoDB
    mongoUser.password = hashedPassword;
    await mongoUser.save();

    return true;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

}

module.exports = new UserRepository();
