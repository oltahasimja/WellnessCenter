import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwitcher from "../components/ThemeSwitcher";
import axios from "axios";

function Navbar({ setTheme, setActiveComponent }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user', {
          withCredentials: true
        });
        
        if (response.data.user) {
          setUserData(response.data.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Krijo inicialet nga emri dhe mbiemri
  const initials = userData 
    ? `${userData.name?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`
    : '';

  const handleProfileClick = () => {
    navigate("/dashboard/profile"); 
    // setActiveComponent("profile");  
   };

  return (
    <nav className="flex items-center justify-end px-3 rounded-md py-1 bg-white shadow-md dark:bg-gray-900 w-[11rem] mr-1 fixed top-0 right-0  z-50">
      {/* Seksioni i kërkimit */}
      <div className="flex items-center">
        {/* You can add a search section here if needed */}
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <button
          className="p-2 rounded bg-gray-200 dark:bg-gray-800 dark:text-white"
          aria-label="Notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        <div className="cursor-pointer" onClick={handleProfileClick}>
  {loading ? (
    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
  ) : userData?.profileImage ? (
    <img
    src={`data:image/jpeg;base64,${userData.profileImage}`}
    alt="Profile"
      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 hover:border-blue-600 transition-colors"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
      <span className="text-blue-600 dark:text-blue-300 font-bold">
        {initials}
      </span>
    </div>
  )}
</div>

        {/* Switcher për Dark Mode / Light Mode */}
        <ThemeSwitcher setTheme={setTheme} />
      </div>
    </nav>
  );
}

export default Navbar;