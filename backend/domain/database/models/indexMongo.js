const UserMongo = require('./Mongo/UserMongo');
const RoleMongo = require('./Mongo/RoleMongo');
const DashboardRoleMongo = require('./Mongo/DashboardRoleMongo');
const CountryMongo = require('./Mongo/CountryMongo');
const CityMongo = require('./Mongo/CityMongo');
const ProfileImageMongo = require('./Mongo/ProfileImageMongo');
const ProgramMongo = require('./Mongo/ProgramMongo');
const UserProgramsMongo = require('./Mongo/UserProgramsMongo');
const TrainingMongo = require('./Mongo/TrainingMongo');
const TrainingApplicationMongo = require('./Mongo/TrainingApplicationMongo');
const ScheduleTrainingMongo = require('./Mongo/ScheduleTrainingMongo');
const ScheduleMongo = require('./Mongo/ScheduleMongo');
{/*const ReviewMongo = require('./Mongo/ReviewMongo');*/}
const ProductMongo = require('./Mongo/ProductMongo');
const OrderMongo = require('./Mongo/OrderMongo');
const ListMongo = require('./Mongo/ListMongo');
const CertificationMongo = require('./Mongo/CertificationMongo');
const CategoryMongo = require('./Mongo/CategoryMongo');
const CardMongo = require('./Mongo/CardMongo');
const CardMemberMongo = require('./Mongo/CardMemberMongo');
const AppointmentMongo = require('./Mongo/AppointmentMongo');
const AttachmentMongo = require('./Mongo/AttachmentMongo');
const GroupMongo = require('./Mongo/GroupMongo');
const UsersGroupMongo = require('./Mongo/UsersGroupMongo');
const MessageMongo = require('./Mongo/MessageMongo');
const CartItemMongo = require('./Mongo/CartItemMongo'); // Uncomment if needed



module.exports = {
  UserMongo,
  CountryMongo,
  DashboardRoleMongo,
  CityMongo,
  ProfileImageMongo,
  ProgramMongo,
  UserProgramsMongo,
  TrainingMongo,
  TrainingApplicationMongo,
  ScheduleTrainingMongo,
  ScheduleMongo,
  RoleMongo,
  //ReviewMongo,
  ProductMongo,
  OrderMongo,
  ListMongo,
  CertificationMongo,
  CategoryMongo,
  CardMongo,
  CardMemberMongo,
  AppointmentMongo,
  AttachmentMongo,
  GroupMongo,
  UsersGroupMongo,
  MessageMongo,
  CartItemMongo

};