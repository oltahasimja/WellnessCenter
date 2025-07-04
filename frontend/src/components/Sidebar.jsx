import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../components/ThemeContext";
import useAuthCheck from '../hook/useAuthCheck';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Calendar,  UserCircle2,  CheckSquare,  FileText,   Table,  FileInput,  MessageCircle,
    Mail, Menu,  ChevronDown,  Github, Trello,LogOut, ListCheck,Clipboard, Antenna,
  Users, Layers, Shield, CalendarClock, GraduationCap, ListOrdered, Package, Tags,
  ClipboardList, UserPlus,Star,TruckIcon

} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { isChecking, user } = useAuthCheck(); 
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-slate-900 bg-slate-50">
        <div className="w-16 h-16 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }
   const isOwner = user?.dashboardRole === 'Owner';
  // const isAdmin = user?.dashboardRole === 'Admin';
  const isSpecialist = ['Nutricionist', 'Fizioterapeut', 'Trajner', 'Psikolog'].includes(user?.role);
  // const isClient = user?.role === 'Client' && user?.dashboardRole === 'User';

  
  //  const AdminSpecialist = isAdmin || (isAdmin && isSpecialist);



  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5001/logout', {}, { withCredentials: true });
      if (response.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMenuItemClick = (componentName) => {
    navigate(`/dashboard/${componentName}`);
  };

  const MenuItem = ({ icon: Icon, label, hasDropdown, componentName, externalLink, onClick }) => (
    <div 
      className={`relative flex flex-col items-start ${isOpen ? 'px-4' : ''} py-2 cursor-pointer text-lg
        hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 transition-all duration-200 rounded-lg mx-2`}
        onClick={() => {
          if (externalLink && onClick) {
            onClick(); 
          } else if (!hasDropdown) {
            handleMenuItemClick(componentName);
          }
          if (hasDropdown) toggleDropdown(label);
        }}
      >
      <div className="flex items-center justify-between w-full">
        <div className={`flex items-center space-x-3 ${isOpen ? 'justify-start' : 'justify-center'} w-full`}>
          <Icon className="w-6 h-6 text-slate-500 dark:text-slate-300 group-hover:text-teal-600" />
          {isOpen && <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>}
        </div>
        {isOpen && hasDropdown && (
          <ChevronDown 
            className={`w-5 h-5 transition-transform text-slate-400 ${openDropdown === label ? 'rotate-180' : ''}`} 
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={`${isOpen ? 'w-72' : 'w-20'} bg-slate-50 dark:bg-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 h-screen overflow-auto transition-all duration-300 shadow-lg flex flex-col justify-between`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div>
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-teal-500 to-slate-600">
          {isOpen && (
            <span
              onClick={() => navigate('/')}
              className="text-xl font-bold cursor-pointer text-white hover:text-teal-100 transition"
            >
              Wellness
            </span>
          )}
          <button onClick={toggleSidebar} className="hover:bg-white/20 p-2 rounded-md transition-colors">
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="py-2 bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          {isOpen && <div className="text-sm text-slate-500 dark:text-slate-400 px-4 py-2 font-semibold tracking-wide">MENU</div>}
          <MenuItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            componentName=""
          />
        
{(isSpecialist || isOwner) && (
        
    <div className="mb-1">
            <MenuItem 
              icon={Package} 
              label="Manage Product" 
              hasDropdown={true}
            />
            {openDropdown === 'Manage Product' && isOpen && (
              <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('product')}
                >
                  <Table className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Product</span>
                </div>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('category')}
                >
                  <Tags className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Category</span>
                </div>
              </div>
            )}
        

          <div className="mb-1">
            <MenuItem 
              icon={Layers} 
              label="Manage Programs" 
              hasDropdown={true}
            />
            {openDropdown === 'Manage Programs' && isOpen && (
              <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('program')}
                >
                  <Table className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Program</span>  
                </div>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('userprograms')}
                >
                  <UserPlus className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">UserPrograms</span>
                </div>
                    <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('log')}
                >
                  <UserPlus className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Log</span>
                </div>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('cardmember')}
                >
                  <UserPlus className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">CardMember</span>
                </div>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('list')}
                >
                  <ListOrdered  className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">List</span>
                </div>


              </div>
            )}
          </div>


          {/* Manage Users Dropdown */}
          {(isOwner || isSpecialist) && (

          <div className="mb-1">
            <MenuItem 
              icon={Users} 
              label="Manage Users" 
              hasDropdown={true}
            />
            {openDropdown === 'Manage Users' && isOpen && (
              <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('users')}
                >
                  <Table className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Users</span>
                </div>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('createuser')}
                >
                  <UserPlus className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Create User</span>
                </div>
              </div>
            )}
         
         




          <div className="mb-1">
            <MenuItem 
              icon={Shield} 
              label="Manage Roles" 
              hasDropdown={true}
            />
            {openDropdown === 'Manage Roles' && isOpen && (
              <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('roles')}
                >
                  <Shield className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Role</span>
                </div>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('dashboardrole')}
                >
                  <Shield className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">DashboardRole</span>
                </div>
              </div>
            )}
          </div>
 </div>
)}
        <div className="mb-1">
          <MenuItem 
            icon={GraduationCap} 
            label="Manage Training" 
            hasDropdown={true}
          />
          {openDropdown === 'Manage Training' && isOpen && (
            <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
              <div 
                className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                onClick={() => handleMenuItemClick('training')}
              >
                <Table className="w-5 h-5 mr-2 text-teal-600" />
                <span className="text-slate-700 dark:text-slate-200">Training</span>
              </div>
              <div 
                className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                onClick={() => handleMenuItemClick('trainingapplication')}
              >
                <UserPlus className="w-5 h-5 mr-2 text-teal-600" />
                <span className="text-slate-700 dark:text-slate-200">TrainingApplication</span>
              </div>
              <div 
                className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                onClick={() => handleMenuItemClick('scheduleTraining')}
              >
                <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                <span className="text-slate-700 dark:text-slate-200">Schedule Training</span>
              </div>
            </div>
          )}
        </div>



          {/* Manage Orders Dropdown */}

         <div className="mb-1">
       <MenuItem 
       icon={ClipboardList} 
       label="Manage Order" 
       hasDropdown={true}
      />
      {openDropdown === 'Manage Order' && isOpen && (
      <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
      <div 
        className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
        onClick={() => handleMenuItemClick('order')}
      >
        <ClipboardList className="w-5 h-5 mr-2 text-teal-600" />
        <span className="text-slate-700 dark:text-slate-200">Orders</span>
         </div>
          <div 
            className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
            onClick={() => handleMenuItemClick('review')}
           >
           </div>
             </div>
           )}
         </div>
            
            {/* Add Delivery Section with Truck Icon */}
          <div className="mb-1">
            <MenuItem 
              icon={TruckIcon} 
              label="Manage Delivery" 
              hasDropdown={true}
            />
            {openDropdown === 'Manage Delivery' && isOpen && (
              <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('delivery')}
                >
                  <TruckIcon className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Delivery</span>
                </div>
              </div>
            )}
          </div>

         {/* <MenuItem 
            icon={ClipboardList} 
            label="Order" 
            componentName="order"
          /> */}
          <MenuItem 
            icon={Antenna} 
            label="Board" 
            componentName="board"
          />

          <MenuItem 
            icon={CalendarClock} 
            label="Schedule" 
            componentName="schedule"
          />

</div> )} 


      <div className="mb-1">
            <MenuItem 
              icon={Calendar} 
              label="Manage Appointment" 
              hasDropdown={true}
            />
            {openDropdown === 'Manage Appointment' && isOpen && (
              <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('appointment')}
                >
                  <Table className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Appointments</span>
                </div>
                <div 
                  className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleMenuItemClick('createappointment')}
                >
                  <UserPlus className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="text-slate-700 dark:text-slate-200">Create Appointment</span>
                </div>
              </div>
            )}
          </div>


           
          <MenuItem 
            icon={UserCircle2} 
            label="Profile" 
            componentName="profile"
          />

          

        

          

<div className="mb-1">
          <MenuItem 
            icon={MessageCircle} 
            label="Manage Group" 
            hasDropdown={true}
          />
          {openDropdown === 'Manage Group' && isOpen && (
            <div className={`ml-12 mt-1 space-y-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2 shadow-inner`}>
              <div 
                className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                onClick={() => handleMenuItemClick('creategroup')}
              >
                <Table className="w-5 h-5 mr-2 text-teal-600" />
                <span className="text-slate-700 dark:text-slate-200">Create Group</span>
              </div>
              <div 
                className="flex items-center px-3 py-2 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                onClick={() => handleMenuItemClick('usersgroup')}
              >
                <UserPlus className="w-5 h-5 mr-2 text-teal-600" />
                <span className="text-slate-700 dark:text-slate-200">UsersGrup</span>
              </div>
            
            </div>
          )}
        </div>

          
        </div>


        <div className="py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          {isOpen && <div className="text-sm text-slate-500 dark:text-slate-400 px-4 py-2 font-semibold tracking-wide">SUPPORT</div>}
          <MenuItem 
            icon={Github} 
            label="Repository" 
            externalLink={true}
            onClick={() => window.open("https://github.com/oltahasimja/WellnessCenter", "_blank", "noopener,noreferrer")}
          />
          <MenuItem 
            icon={Trello} 
            label="Trello" 
            externalLink={true}
            onClick={() => window.open("https://trello.com/b/EmwZHmbt/wellness-center", "_blank", "noopener,noreferrer")}
          />
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
        <button 
          onClick={handleLogout} 
          className="flex items-center w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <LogOut className="w-6 h-6" />
          {isOpen && <span className="ml-2 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;