import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';
import useAuthCheck from '../hook/useAuthCheck'; 
import List from './List';
import UserPrograms from './UserPrograms';
import User from './User';
import Profile from './Profile';
import Program from './Program';
import CreateUser from './CreateUser';

function Dashboard() {
  useAuthCheck();

  // const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState("dashboard");



  const renderComponent = () => {
    switch (activeComponent) {
      case "user": return <User setActiveComponent={setActiveComponent} />;
      case "profile": return <Profile setActiveComponent={setActiveComponent} />;
      case "program": return <Program />;
      case "createuser": return <CreateUser setActiveComponent={setActiveComponent} />; 
      case "userprograms": return <UserPrograms />;
      case "list": return <List/>
      default: 
        return <h1 className="text-2xl font-bold">Mirë se vini në Dashboard</h1>;
    }
  };

  return (
    <div className="h-screen flex flex-col">
<Navbar setActiveComponent={setActiveComponent} />
      <div className="flex flex-1">
        <Sidebar setActiveComponent={setActiveComponent} />
        <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
