const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const {
  User,
  Role,
  DashboardRole,
  Country,
  City
} = require('../domain/database/models');

const {
  UserMongo,
  RoleMongo,
  DashboardRoleMongo,
  CountryMongo,
  CityMongo
} = require('../domain/database/models/indexMongo');

const createDefaultRolesAndUsers = async () => {
  try {
    await sequelize.sync();

    // 1. Create roles
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

    // 2. Create country and cities
    const [kosova, createdCountry] = await Country.findOrCreate({ where: { name: 'Kosovë' } });
    const kosovaMongo = await CountryMongo.findOneAndUpdate(
      { name: 'Kosovë' },
      { name: 'Kosovë', mysqlId: kosova.id.toString() },
      { upsert: true, new: true }
    );

    const cities = ['Prishtinë', 'Lipjan', 'Podujevë', 'Istogu', 'Gjakovë', 'Ferizaj'];
    const cityMap = {};

    for (const cityName of cities) {
      const [city, _] = await City.findOrCreate({ where: { name: cityName, countryId: kosova.id } });
      const cityMongo = await CityMongo.findOneAndUpdate(
        { name: cityName },
        { name: cityName, mysqlId: city.id.toString(), countryId: kosovaMongo._id },
        { upsert: true, new: true }
      );
      cityMap[cityName] = { sql: city, mongo: cityMongo };
    }

    // 3. Prepare role map
    const roleMap = {};
    for (let roleName of roles) {
      const sqlRole = await Role.findOne({ where: { name: roleName } });
      const mongoRole = await RoleMongo.findOne({ name: roleName });
      roleMap[roleName] = { sql: sqlRole, mongo: mongoRole };
    }

    const dashboardOwner = await DashboardRole.findOne({ where: { name: 'Owner' } });
    const dashboardOwnerMongo = await DashboardRoleMongo.findOne({ name: 'Owner' });

    // 4. Users to create
    const usersToCreate = [
      {
        name: 'Shaban',
        lastName: 'Buja',
        username: 'bani',
        email: 'bani@gmail.com',
        role: 'Client',
        dashboardRole: 'Owner',
        birthday: '2004-02-29',
        city: 'Lipjan',
        gender: 'Male'
      },
      {
        name: 'Olta',
        lastName: 'Hasimja',
        username: 'olta',
        email: 'olta@gmail.com',
        role: 'Nutricionist',
        birthday: '1992-08-10',
        city: 'Gjakovë',
        gender: 'Female'

      },
      {
        name: 'Festim',
        lastName: 'Hyseni',
        username: 'festim',
        email: 'festim@gmail.com',
        role: 'Fizioterapeut',
        birthday: '1988-12-01',
        city: 'Podujevë',
        gender: 'Male'

      },
      {
        name: 'Vesa',
        lastName: 'Grajqevci',
        username: 'vesa',
        email: 'vesa@gmail.com',
        role: 'Trajner',
        birthday: '1995-07-18',
        city: 'Prishtinë',
        gender: 'Female'

      },
      {
        name: 'Greta',
        lastName: 'Gashi',
        username: 'greta',
        email: 'greta@gmail.com',
        role: 'Psikolog',
        birthday: '1990-03-22',
        city: 'Istogu',
        gender: 'Female'

      },
      {
        name: 'Rinarda',
        lastName: 'Lahu',
        username: 'rinarda',
        email: 'rinarda@gmail.com',
        role: 'Fizioterapeut',
        birthday: '1993-09-14',
        city: 'Prishtinë',
        gender: 'Female'

      }
    ];

    // 5. Create each user
    for (const userData of usersToCreate) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (existing) {
        console.log(`Përdoruesi ${userData.email} ekziston.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash('bani1234', 10);
      const userCity = cityMap[userData.city];

      const newUser = await User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        lastName: userData.lastName,
        number: '000000000',
        birthday: userData.birthday,
        roleId: roleMap[userData.role].sql.id,
        dashboardRoleId: userData.dashboardRole === 'Owner' ? dashboardOwner.id : null,
        countryId: kosova.id,
        cityId: userCity.sql.id
      });

      await UserMongo.create({
        mysqlId: newUser.id.toString(),
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        lastName: userData.lastName,
        number: '000000000',
        birthday: new Date(userData.birthday),
        roleId: roleMap[userData.role].mongo._id,
        dashboardRoleId: userData.dashboardRole === 'Owner' ? dashboardOwnerMongo._id : null,
        countryId: kosovaMongo._id,
        cityId: userCity.mongo._id
      });

      console.log(`Përdoruesi ${userData.email} u krijua.`);
    }

  } catch (err) {
    console.error('Gabim në seed:', err.message);
  } finally {
    process.exit();
  }
};

createDefaultRolesAndUsers();
