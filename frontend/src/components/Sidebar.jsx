import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../components/ThemeContext";
import axios from 'axios';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCircle2, 
  CheckSquare, 
  FileText, 
  Table, 
  FileInput, 
  MessageCircle, 
  Mail, 
  Menu, 
  ChevronDown, 
  Github,
  Trello,
  LogOut, 
  ListCheck,
  Clipboard,
  Antenna
} from 'lucide-react';

const Sidebar = ({ setActiveComponent }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      if (response.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMenuItemClick = (componentName) => {
    setActiveComponent(componentName);
    localStorage.setItem('activeComponent', componentName);
  };

  const MenuItem = ({ icon: Icon, label, hasDropdown, componentName, externalLink, onClick }) => (
    <div 
      className={`relative flex flex-col items-start ${isOpen ? 'px-4' : ''} py-2 cursor-pointer text-lg
        hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700`}
        onClick={() => {
          if (externalLink && onClick) {
            onClick(); 
          } else {
            handleMenuItemClick(componentName);
            if (hasDropdown) toggleDropdown(label);
          }
        }}
      >
      <div className="flex items-center justify-between w-full">
        <div className={`flex items-center space-x-3 ${isOpen ? 'justify-start' : 'justify-center'} w-full`}>
          <Icon className="w-6 h-6 text-gray-500 dark:text-gray-300 group-hover:text-blue-700" />
          {isOpen && <span className="font-medium">{label}</span>}
        </div>
        {isOpen && hasDropdown && (
          <ChevronDown 
            className={`w-5 h-5 transition-transform ${openDropdown === label ? 'rotate-180' : ''}`} 
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-900 dark:text-white border-r h-screen transition-all duration-300 shadow-md flex flex-col justify-between`}>
      <div>
        <div className="px-4 py-4 border-b flex items-center justify-between">
          {isOpen && <span className="text-xl font-semibold">Wellness</span>}
          <button onClick={toggleSidebar} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="py-2">
          {isOpen && <div className="text-sm text-gray-400 px-4 py-2">MENU</div>}
          <MenuItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            componentName="dashboard"
          />
          <MenuItem 
            icon={Calendar} 
            label="Program" 
            componentName="program"
          />
          <MenuItem 
            icon={UserCircle2} 
            label="Profile" 
            componentName="profile"
          />
          <MenuItem 
            icon={Table} 
            label="Users" 
            componentName="user"
          />
          <MenuItem 
            icon={FileText} 
            label="Roles" 
            componentName="role"
          />
          <MenuItem 
            icon={FileInput} 
            label="Create User" 
            componentName="createuser"
          />
          <MenuItem 
            icon={Table} 
            label="Schedule" 
            componentName="schedule"
          />
          <MenuItem 
            icon={CheckSquare} 
            label="Training" 
            componentName="training"
          />
          <MenuItem 
            icon={CheckSquare} 
            label="TrainingApplication" 
            componentName="trainingapplication"
          />
          <MenuItem 
            icon={ListCheck} 
            label="List" 
            componentName="list"
          />
          <MenuItem 
            icon={ListCheck} 
            label="UserPrograms" 
            componentName="userprograms"
          />
            <MenuItem 
            icon={Clipboard} 
            label="Order" 
            componentName="order"
          />
          <MenuItem 
            icon={Antenna} 
            label="Board" 
            componentName="board"
          />
        </div>

        <div className="py-2 border-t">
         {isOpen && <div className="text-sm text-gray-400 px-4 py-2">SUPPORT</div>}
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

      <div className="p-4 border-t">
        <button 
          onClick={handleLogout} 
          className="flex items-center w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          <LogOut className="w-6 h-6" />
          {isOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;