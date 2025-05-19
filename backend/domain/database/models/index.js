const sequelize = require('../../../config/database');

// Import models
const Role = require('./MySQL/Role');
const Country = require('./MySQL/Country');
const City = require('./MySQL/City');
const ProfileImage = require('./MySQL/ProfileImage');
const DashboardRole = require('./MySQL/DashboardRole');
const User = require('./MySQL/User');
const Appointment = require('./MySQL/Appointment');
const Program = require('./MySQL/Program');
const Card = require('./MySQL/Card');
const CardMember = require('./MySQL/CardMember');
const Certification = require('./MySQL/Certification');
const Schedule = require('./MySQL/Schedule');
const Training = require('./MySQL/Training');
const TrainingApplication = require('./MySQL/TrainingApplication');
const UserPrograms = require('./MySQL/UserPrograms');
const List = require('./MySQL/List');
const Log = require('./MySQL/log');
const Group = require('./MySQL/Group');
const UsersGroup = require('./MySQL/UsersGroup');

const ScheduleTraining = require('./MySQL/ScheduleTraining');

// Initialize models - try to handle different patterns safely
function initializeModel(model, seq) {
  if (typeof model === 'function') {
    // If it's a function, call it with sequelize
    try {
      return model(seq);
    } catch (e) {
      // If calling as function fails, it might be a class
      if (e instanceof TypeError && e.message.includes('cannot be invoked without \'new\'')) {
        return model; // It's already initialized
      }
      throw e;
    }
  } else {
    // If it's not a function, return as is (already initialized)
    return model;
  }
}

// Initialize all models safely
const LogModel = initializeModel(Log, sequelize);
const RoleModel = initializeModel(Role, sequelize);
const CountryModel = initializeModel(Country, sequelize);
const CityModel = initializeModel(City, sequelize);
const ProfileImageModel = initializeModel(ProfileImage, sequelize);
const DashboardRoleModel = initializeModel(DashboardRole, sequelize);
const UserModel = initializeModel(User, sequelize);
const AppointmentModel = initializeModel(Appointment, sequelize);
const ProgramModel = initializeModel(Program, sequelize);
const CardModel = initializeModel(Card, sequelize);
const CardMemberModel = initializeModel(CardMember, sequelize);
const CertificationModel = initializeModel(Certification, sequelize);
const ScheduleModel = initializeModel(Schedule, sequelize);
const TrainingModel = initializeModel(Training, sequelize);
const TrainingApplicationModel = initializeModel(TrainingApplication, sequelize);
const UserProgramsModel = initializeModel(UserPrograms, sequelize);
const ListModel = initializeModel(List, sequelize);
const GroupModel = initializeModel(Group, sequelize);
const UsersGroupModel = initializeModel(UsersGroup, sequelize);
const ScheduleTrainingModel = initializeModel(ScheduleTraining, sequelize);





// Log relationships
UserModel.hasMany(LogModel, { foreignKey: 'userId' });
LogModel.belongsTo(UserModel, { foreignKey: 'userId' });

// User relationships
RoleModel.hasMany(UserModel, { foreignKey: 'roleId' });
UserModel.belongsTo(RoleModel, { foreignKey: 'roleId' });

DashboardRoleModel.hasMany(UserModel, { foreignKey: 'dashboardRoleId' });
UserModel.belongsTo(DashboardRoleModel, { foreignKey: 'dashboardRoleId' });

CountryModel.hasMany(UserModel, { foreignKey: 'countryId' });
UserModel.belongsTo(CountryModel, { foreignKey: 'countryId' });

CityModel.hasMany(UserModel, { foreignKey: 'cityId' });
UserModel.belongsTo(CityModel, { foreignKey: 'cityId' });

ProfileImageModel.hasMany(UserModel, { foreignKey: 'profileImageId' });
UserModel.belongsTo(ProfileImageModel, { foreignKey: 'profileImageId' });

// Appointment relationships
UserModel.hasMany(AppointmentModel, { foreignKey: 'userId', as: 'appointments' });
UserModel.hasMany(AppointmentModel, { foreignKey: 'specialistId', as: 'specialistAppointments' });
UserModel.hasOne(ScheduleModel, { foreignKey: 'specialistId' });
ScheduleModel.belongsTo(UserModel, { foreignKey: 'specialistId' });

AppointmentModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'client' });
AppointmentModel.belongsTo(UserModel, { foreignKey: 'specialistId', as: 'specialist' });

// Program relationships
UserModel.hasMany(ProgramModel, { foreignKey: 'createdById' });
ProgramModel.belongsTo(UserModel, { foreignKey: 'createdById' });

UserModel.hasMany(GroupModel, { foreignKey: 'createdById' });
GroupModel.belongsTo(UserModel, { foreignKey: 'createdById' });

UserModel.belongsToMany(Group, { through: UsersGroup, foreignKey: 'userId' });
Group.belongsToMany(UserModel, { through: UsersGroup, foreignKey: 'groupId' });

UserModel.belongsToMany(ProgramModel, { through: UserProgramsModel, foreignKey: 'userId' });
ProgramModel.belongsToMany(UserModel, { through: UserProgramsModel, foreignKey: 'programId' });

// List and Card relationships
ListModel.hasMany(CardModel, { foreignKey: 'listId', onDelete: 'CASCADE' });
CardModel.belongsTo(ListModel, { foreignKey: 'listId' });


UserModel.hasMany(CardModel, { foreignKey: 'createdById', onDelete: 'CASCADE' });
CardModel.belongsTo(UserModel, { foreignKey: 'createdById' });

UserModel.belongsToMany(CardModel, { through: CardMemberModel, foreignKey: 'userId' });
CardModel.belongsToMany(UserModel, { through: CardMemberModel, foreignKey: 'cardId' });

// Training and Certification relationships
UserModel.hasMany(CertificationModel, { foreignKey: 'userId' });
CertificationModel.belongsTo(UserModel, { foreignKey: 'userId' });

TrainingModel.hasMany(CertificationModel, { foreignKey: 'trainingId' });
CertificationModel.belongsTo(TrainingModel, { foreignKey: 'trainingId' });

UserModel.hasMany(TrainingApplicationModel, { foreignKey: 'userId' });
TrainingApplicationModel.belongsTo(UserModel, { foreignKey: 'userId' });

TrainingModel.hasMany(TrainingApplicationModel, { foreignKey: 'trainingId' });
TrainingApplicationModel.belongsTo(TrainingModel, { foreignKey: 'trainingId' });

TrainingModel.hasOne(ScheduleTrainingModel, { foreignKey: 'trainingId' });
ScheduleTrainingModel.belongsTo(TrainingModel, { foreignKey: 'trainingId' });

UserModel.hasMany(ListModel, { foreignKey: 'createdById' });
ListModel.belongsTo(UserModel, { foreignKey: 'createdById' });

// Program and List relationship
ProgramModel.hasMany(ListModel, { foreignKey: 'programId' });
ListModel.belongsTo(ProgramModel, { foreignKey: 'programId' });

module.exports = {
  sequelize,
  Role: RoleModel,
  Country: CountryModel,
  City: CityModel,
  ProfileImage: ProfileImageModel,
  DashboardRole: DashboardRoleModel,
  User: UserModel,
  Appointment: AppointmentModel,
  Program: ProgramModel,
  Card: CardModel,
  CardMember: CardMemberModel,
  Certification: CertificationModel,
  Schedule: ScheduleModel,
  Training: TrainingModel,
  TrainingApplication: TrainingApplicationModel,
  UserPrograms: UserProgramsModel,
  List: ListModel,
  Log: LogModel,
  Group: GroupModel,
  UsersGroup: UsersGroupModel,
  ScheduleTraining: ScheduleTrainingModel
};