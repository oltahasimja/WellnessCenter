import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/user', {
          withCredentials: true
        });
        
        if (response.data.user) {
          setUserData(response.data.user);
        } else {
          navigate('/login');
        }
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kontrollo formatet e lejuara
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jfif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Ju lutem zgjidhni një foto në formatin JPEG, PNG ose JFIF');
      return;
    }

    // Kontrollo madhësinë e file (deri në 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Foto duhet të jetë më e vogël se 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        await axios.put(`http://localhost:5000/api/user/${userData.id}`, {
          profileImage: base64Image
        }, {
          withCredentials: true
        });
        
        // Rifresko të dhënat e përdoruesit
        const response = await axios.get('http://localhost:5000/user', {
          withCredentials: true
        });
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error updating profile image:', error);
        setError('Failed to update profile image');
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 mb-[2rem]">
          <Sidebar />
          <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 mb-[2rem]">
          <Sidebar />
          <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Krijo inicialet nga emri dhe mbiemri
  const initials = `${userData.name?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`;

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 mb-[2rem]">
        <Sidebar />
        <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-10xl mx-auto p-6 bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>
              <div className="border-b border-gray-200"></div>
            </div>

            {/* Profile Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Profile</h2>
              <div className="flex items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shadow-md">
                    {userData.profileImage ? (
                      <img 
                        src={userData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-blue-600 text-3xl font-bold">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.jfif"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profileImageInput"
                    />
                    <label 
                      htmlFor="profileImageInput"
                      className="w-full h-full rounded-full flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                      title="Change profile photo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-gray-800">{userData.name} {userData.lastName}</h3>
                  <p className="text-gray-600 text-lg">{userData.role} | Lab Course.</p>
                </div>
              </div>
              <div className="border-b border-gray-200"></div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500">Username</p>
                    <p className="font-medium text-gray-800">{userData.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">First Name</p>
                    <p className="font-medium text-gray-800">{userData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Name</p>
                    <p className="font-medium text-gray-800">{userData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Birthday</p>
                    <p className="font-medium text-gray-800">{userData.birthday}</p>
                  </div>
                  
                </div>
                <div className="space-y-4">
                <div>
                    <p className="text-gray-500">Gender</p>
                    <p className="font-medium text-gray-800">{userData.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email address</p>
                    <p className="font-medium text-gray-800">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">{userData.number}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-500">Bio</p>
                    <p className="font-medium text-gray-800">{userData.role}</p>
                  </div>
                </div>
              </div>
              <div className="border-b border-gray-200"></div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Country</p>
                  <p className="font-medium text-gray-800">{userData.country}</p>
                  </div>
                <div>
                  <p className="text-gray-500">City/State</p>
                  <p className="font-medium text-gray-800">{userData.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;