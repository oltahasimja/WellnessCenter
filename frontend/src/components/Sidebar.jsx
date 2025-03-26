import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../components/ThemeContext"; // Importo kontekstin e temës
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
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme(); // Merr temën nga konteksti

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

  const MenuItem = ({ icon: Icon, label, active, hasDropdown, children }) => (
    <div 
      className={`relative flex flex-col items-start ${isOpen ? 'px-4' : ''} py-2 cursor-pointer text-lg
        ${active ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white' : 'hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700'}`}
      onClick={() => hasDropdown && toggleDropdown(label)}
    >
      <div className="flex items-center justify-between w-full">
        <div className={`flex items-center space-x-3 ${isOpen ? 'justify-start' : 'justify-center'} w-full`}>
          <Icon className={`w-6 h-6 ${active ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-gray-300'} group-hover:text-blue-700`} />
          {isOpen && <span className="font-medium">{label}</span>}
        </div>
        {isOpen && hasDropdown && (
          <ChevronDown 
            className={`w-5 h-5 transition-transform ${openDropdown === label ? 'rotate-180' : ''}`} 
          />
        )}
      </div>
      {isOpen && hasDropdown && openDropdown === label && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-lg z-10">
          <div className="py-2 px-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} 
      bg-white dark:bg-gray-900 dark:text-white border-r h-screen overflow-hidden 
      transition-all duration-300 ease-in-out shadow-md flex flex-col justify-between`}>
      
      {/* Header */}
      <div>
        <div className="px-4 py-4 border-b flex items-center justify-between">
          {isOpen && <span className="text-xl font-semibold">Wellness</span>}
          <button onClick={toggleSidebar} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Menu */}
        <div className="py-2">
          {isOpen && <div className="text-sm text-gray-400 px-4 py-2">MENU</div>}
          <MenuItem icon={LayoutDashboard} label="Dashboard" active />
          <MenuItem icon={Calendar} label="Calendar" />
          <MenuItem icon={UserCircle2} label="User Profile" />
          <MenuItem icon={CheckSquare} label="Task" hasDropdown>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md">Task 1</button>
              <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md">Task 2</button>
              <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md">Task 3</button>
            </div>
          </MenuItem>
          <MenuItem icon={FileText} label="Forms" hasDropdown />
          <MenuItem icon={Table} label="Tables" hasDropdown />
          <MenuItem icon={FileInput} label="Pages" hasDropdown />
        </div>
        
        {/* Support Section */}
        <div className="py-2 border-t">
          {isOpen && <div className="text-sm text-gray-400 px-4 py-2">SUPPORT</div>}
          <MenuItem icon={MessageCircle} label="Chat" hasDropdown />
          <MenuItem icon={Mail} label="Email" hasDropdown />
          <MenuItem icon={FileInput} label="Invoice" hasDropdown />
        </div>
      </div>

      {/* Logout Button */}
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
