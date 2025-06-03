const bcrypt = require('bcryptjs');
const  sequelize  = require('../config/database');
const { User, Role, DashboardRole } = require('../domain/database/models');
const { UserMongo, RoleMongo, DashboardRoleMongo } = require('../domain/database/models/indexMongo');

const createDefaultRolesAndOwner = async () => {
  try {
    await sequelize.sync();

    const roles = ['Client', 'Fizioterapeut', 'Nutricionist', 'Trajner', 'Psikolog'];
    for (let roleName of roles) {
      const [role, created] = await Role.findOrCreate({ where: { name: roleName } });
      if (created) {
        await RoleMongo.create({ mysqlId: role.id.toString(), name: roleName });
        console.log(`Roli '${roleName}' u krijua.`);
      }
    }

    const dashboardRoles = ['Owner'];
    for (let roleName of dashboardRoles) {
      const [role, created] = await DashboardRole.findOrCreate({ where: { name: roleName } });
      if (created) {
        await DashboardRoleMongo.create({ mysqlId: role.id.toString(), name: roleName });
        console.log(`Dashboard roli '${roleName}' u krijua.`);
      }
    }

    const clientRole = await Role.findOne({ where: { name: 'Client' } });
    const clientRoleMongo = await RoleMongo.findOne({ name: 'Client' });
    const ownerDashboardRole = await DashboardRole.findOne({ where: { name: 'Owner' } });

    const existingOwner = await User.findOne({ where: { email: 'owner@gmail.com' } });

    if (!existingOwner) {
      const hashedPassword = await bcrypt.hash('owner', 10);
      const newOwner = await User.create({
        username: 'owner',
        email: 'owner@gmail.com',
        password: hashedPassword,
        dashboardRoleId: ownerDashboardRole.id,
        name: 'Owner',
        lastName: 'Account',
        roleId: clientRole.id,
        number: '123456789'
      });

      await UserMongo.create({
        mysqlId: newOwner.id.toString(),
        username: 'owner',
        email: 'owner@gmail.com',
        dashboardRole: 'Owner',
        name: 'Owner',
        password: hashedPassword,
        lastName: 'Account',
        number: '123456789',
        roleId: clientRoleMongo._id
      });

      console.log('Owner user u krijua në të dy databazat.');
    } else {
      console.log('Owner user ekziston tashmë.');
    }

  } catch (err) {
    console.error('Gabim në seed:', err.message);
  } finally {
    process.exit();
  }
};

createDefaultRolesAndOwner();
