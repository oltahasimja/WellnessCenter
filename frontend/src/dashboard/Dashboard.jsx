import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';
import useAuthCheck from '../hook/useAuthCheck';
import List from './List';
import UserPrograms from './UserPrograms';
import User from './User';
import Profile from './Profile';
import Program from './Program';
import CreateUser from './CreateUser';
import EditUser from './EditUser';
import Role from './Role';
import Training from './Training';
import Card from './Card';
import Schedule from './Schedule';
import TrainingApplication from './TrainingApplication'

function Dashboard() {

  axios.defaults.withCredentials = true;

  useAuthCheck();
  const { pathname } = useLocation();
  
  const [activeComponent, setActiveComponent] = useState(() => {
    return localStorage.getItem('activeComponent') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('activeComponent', activeComponent);
  }, [activeComponent]);

  useEffect(() => {
    if (pathname.startsWith('/edituser/')) {
      const id = pathname.split('/')[2];
      localStorage.setItem('editUserId', id);
      setActiveComponent('edituser');
    }
  }, [pathname]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "user": return <User setActiveComponent={setActiveComponent} />;
      case "profile": return <Profile setActiveComponent={setActiveComponent} />;
      case "program": return <Program />;
      case "createuser": return <CreateUser setActiveComponent={setActiveComponent} />;
      case "edituser": return <EditUser setActiveComponent={setActiveComponent} />;
      case "userprograms": return <UserPrograms />;
      case "list": return <List />;
      case "role": return <Role />;
      case "training": return <Training />;
      case "trainingapplication": return <TrainingApplication />;



      case "card": return <Card />;

      case "schedule": return <Schedule />;

      // case "training": return <Training />;
      // case "board": return <Board />;
      default: 
        return <h1 className="text-2xl font-bold">Mirë se vini në Dashboard</h1>;
    }
  };

  return (
    <div className="h-screen flex flex-col">
    <Navbar setActiveComponent={setActiveComponent} />
    <div className="flex flex-1">
      <div className="h-screen">
        <Sidebar setActiveComponent={setActiveComponent} />
      </div>
      
      <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto h-screen">
        {renderComponent()}
      </div>
    </div>
  </div>
  );
}

export default Dashboard;