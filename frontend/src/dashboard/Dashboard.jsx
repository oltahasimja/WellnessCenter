import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';

function Dashboard() {
  const navigate = useNavigate();
  

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (!response.data.user) {
          navigate('/login');
        }
      } catch (error) {
        console.log('Përdoruesi nuk është i kyçur.');
        navigate('/login');
      }
    };
    checkLoginStatus();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar lart */}
      <Navbar />
      <div className="flex flex-1 mb-[2rem]">
        {/* Sidebar në të majtë */}
        <Sidebar />
        {/* Përmbajtja e Dashboard-it */}
        <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Mirë se vini në panelin tuaj! Këtu mund të menaxhoni të gjitha funksionet.
          </p>

          
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
