import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';
import useAuthCheck from '../hook/useAuthCheck';
import List from './List';
import UserPrograms from './UserPrograms';
import User from './Users/User';
import Profile from './Profile';
import Program from './Program';
import CreateUser from './Users/CreateUser';
import EditUser from './Users/EditUser';
import Role from './Roles/Role';
import DashboardRole from './Roles/DashboardRole';
import Training from './Training';
import Card from './Card';
import Schedule from './Schedule';
import TrainingApplication from './TrainingApplication';
import Order from './Order';
import Appointments from './Appointment/Appointment';
import CreateAppointment from './Appointment/CreateAppointment';
import Product from './Product';
import Category from './Category';
import Cart from './Cart';


function Dashboard() {
  axios.defaults.withCredentials = true;
  useAuthCheck();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  // Use getActiveComponent directly inside useEffect
  const [activeComponent, setActiveComponent] = useState(() => {
    const pathParts = pathname.split('/');
    return pathParts.length > 2 ? pathParts[2] : localStorage.getItem('lastActiveComponent') || '';
  });

  useEffect(() => {
    const getActiveComponent = () => {
      const pathParts = pathname.split('/');
      return pathParts.length > 2 ? pathParts[2] : '';
    };

    const component = getActiveComponent();
    if (component) {
      setActiveComponent(component);
      localStorage.setItem('lastActiveComponent', component);
    }

    if (pathname.startsWith('/dashboard/edituser/')) {
      const id = pathname.split('/')[3];
      localStorage.setItem('editUserId', id);
    }
  }, [pathname]);  // Only pathname as a dependency

  const renderComponent = () => {
    switch (activeComponent) {
      case "users": return <User navigate={navigate} />;
      case "profile": return <Profile />;
      case "appointment": return <Appointments />;
      case "createappointment": return <CreateAppointment />;
      case "program": return <Program />;
      case "createuser": return <CreateUser navigate={navigate} />;
      case "edituser": return <EditUser navigate={navigate} />;
      case "userprograms": return <UserPrograms />;
      case "list": return <List />;
      case "roles": return <Role />;
      case "dashboardrole": return <DashboardRole />;
      case "training": return <Training />;
      case "trainingapplication": return <TrainingApplication />;
      case "order": return <Order />;
      case "card": return <Card />;
      case "schedule": return <Schedule />;
      case "product": return <Product />;
      case "category": return <Category />;
      case "cart": return <Cart />;
     
      case "": 
      case null:
      case undefined:
        return <h1 className="text-2xl font-bold">Mirë se vini në Dashboard</h1>;
      default:
        return <h1 className="text-2xl font-bold">Komponenti nuk u gjet</h1>;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <div className="bg-white dark:bg-gray-900 dark:text-white">
          <Sidebar />
        </div>
      
        <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto h-screen" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {renderComponent()}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
