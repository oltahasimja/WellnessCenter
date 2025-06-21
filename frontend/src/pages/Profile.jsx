import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";



function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    birthday: '',
    gender: '',
    number: '',
    country: '',
    city: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const navigate = useNavigate();

  const fetchCountries = async (retryCount = 3) => {
    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await axios.get("https://countriesnow.space/api/v0.1/countries", {
          withCredentials: false 
        });
        
        if (response.data?.data) {
          setCountryList(response.data.data);
        }
      } catch (error) {
        console.error(`Attempt ${i + 1} to fetch countries failed:`, error);
      }
    }
  };

  // Handle country change
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setFormData(prev => ({ ...prev, country }));
    
    if (!countryList.length) {
      console.warn("Country list is empty, refreshing...");
      fetchCountries();
      return;
    }
    
    if (country === "Kosovo") {
      setCityList([
        "Prishtina", "Prizreni", "Peja", "Gjakova", "Ferizaj", "Gjilani", "Mitrovica",
        "Podujeva", "Vushtrria", "Suhareka", "Rahoveci", "Malisheva", "Drenasi", "Skenderaj",
        "Kamenica", "Istogu", "Deçani", "Dragashi", "Klinë", "Leposaviq", "Zubin Potok", "Zveçan",
        "Shtime", "Fushë Kosova", "Lipjan", "Obiliq", "Novobërda", "Junik", "Hani i Elezit",
        "Kaçaniku", "Mamushë", "Graçanica", "Ranillug", "Partesh", "Kllokot"
      ]);
    } else {
      const countryData = countryList.find(c => c.country === country);
      setCityList(countryData ? countryData.cities : []);
    }
    
    setSelectedCity("");
    setFormData((prev) => ({ ...prev, city: "" }));
  };

  // Handle city change
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setFormData((prev) => ({ ...prev, city }));
  };

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/user', {
          withCredentials: true
        });
        
        if (response.data.user) {
          setUserData(response.data.user);
          const user = response.data.user;
          setFormData({
            birthday: user.birthday ? user.birthday.split('T')[0] : '',
            gender: user.gender || '',
            number: user.number || '',
            country: user.countryId || '', // Use countryId for form
            city: user.cityId || '', // Use cityId for form
            profileImage: user.profileImageId || null
          });
          
          // Set selected country and city names for display
          setSelectedCountry(user.country || '');
          setSelectedCity(user.city || '');
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
    fetchCountries(); // Fetch countries on component mount
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jfif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Ju lutem zgjidhni një foto në formatin JPEG, PNG ose JFIF');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert('Foto duhet të jetë më e vogël se 5MB');
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result.split(',')[1]; // Heq header-in
        
        await axios.put(`http://localhost:5001/api/user/${userData.id}`, {
          profileImage: base64Image
        }, {
          withCredentials: true
        });
        
        // Rifresko të dhënat e përdoruesit
        const response = await axios.get('http://localhost:5001/user', {
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

  const handleEditToggle = (item) => {
    // Create a copy of the item to avoid direct modification
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setEditing(editData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message when user starts typing
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const handleRemovePhoto = async () => {
    try {
      const userId = userData.id || userData.mysqlId;
      if (!userId) {
        throw new Error('User ID not found');
      }
  
      await axios.put(`http://localhost:5001/api/user/${userId}`, {
        profileImage: null
      }, {
        withCredentials: true
      });
      
      const response = await axios.get('http://localhost:5001/user', {
        withCredentials: true
      });
      setUserData(response.data.user);
    } catch (error) {
      console.error('Error removing profile image:', error);
      setError('Failed to remove profile image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = userData.id || userData.mysqlId;
      if (!userId) {
        throw new Error('User ID not found');
      }
  
      const updateData = {
        birthday: formData.birthday,
        gender: formData.gender,
        number: formData.number,
        dashboardRoleId: userData.dashboardRoleId 
      };
  
      if (selectedCountry) {
        updateData.country = selectedCountry;
      }
      if (selectedCity) {
        updateData.city = selectedCity;
      }
  
      // Dërgo të dhënat e përditësuara në server
      await axios.put(`http://localhost:5001/api/user/${userId}`, updateData, {
        withCredentials: true
      });
  
      // Rifresko të dhënat e përdoruesit
      const response = await axios.get('http://localhost:5001/user', {
        withCredentials: true
      });
      
      setUserData(response.data.user);
      setEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Gabim gjatë përditësimit: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
  
    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
  
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
  
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
  
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
  
    try {
      // Use the correct ID field from your userData
      const userId = userData?.id;
      if (!userId) {
        throw new Error('User ID not found in user data');
      }
  
      // Debug log
      console.log('Attempting password update for user:', {
        userId,
        email: userData.email
      });
  
      // Send password update request
      const response = await axios.put(
        `http://localhost:5001/api/user/${userId}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
  
      setPasswordSuccess('Password updated successfully');
  
      // Hide password section after successful update
      setTimeout(() => {
        setShowPasswordSection(false);
        setPasswordSuccess('');
      }, 3000);
  
    } catch (error) {
      console.error('Password update error:', {
        error: error.message,
        response: error.response?.data,
        config: error.config
      });
  
      setPasswordError(
        error.response?.data?.message || 
        'Failed to update password. Please try again.'
      );
    }
  };

  const togglePasswordSection = () => {
    setShowPasswordSection(!showPasswordSection);
    // Reset password data and errors when toggling
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-1 mb-8">
            
          <div className="flex items-center justify-center min-h-screen bg-teal-400">
            <div className="w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-1 mb-8">
          <div className="p-6 flex-1 bg-teal-400 flex items-center justify-center">
            <div className="text-lg text-red-700 bg-white px-6 py-4 rounded-lg shadow-md">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${userData.name?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`;

  return (
    <div className="h-screen flex flex-col ">
        <Header />
      <div className="flex flex-1 mb-8">
         <div className="fixed top-5 left-5 z-50 flex space-x-4">
                <div 
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 text-teal-700 hover:text-teal-900 transition-all duration-300 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg hover:shadow-xl cursor-pointer border border-teal-100"
                >
                  <FaArrowLeft className="text-lg" />
                  <span className="font-medium">Back to Home</span>
                </div>
                
              
              </div>
       
        <div className="p-6 flex-1 bg-teal-400">
        

          <div className="max-w-10xl mx-auto p-6 rounded-lg shadow-md bg-white">
            {/* Header with Edit Button */}
            <div className="mb-8 flex justify-between items-center mt-[5rem]">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-teal-700">Profile</h1>
                <div className="border-b border-teal-200"></div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={togglePasswordSection}
                  className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {showPasswordSection ? 'Hide Password Reset' : 'Change Password'}
                </button>
                <button
                  onClick={() => handleEditToggle(userData)}
                  className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-md bg-teal-100">
                    {userData.profileImage ? (
                      <img 
                        src={`data:image/jpeg;base64,${userData.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-teal-600">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.jfif"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profileImageInput"
                    />
                    <label 
                      htmlFor="profileImageInput"
                      className="w-full h-1/2 rounded-t-full flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                      title="Change profile photo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    {userData.profileImage && (
                      <button
                        onClick={handleRemovePhoto}
                        className="w-full h-1/2 rounded-b-full flex items-center justify-center bg-black bg-opacity-30 cursor-pointer hover:bg-opacity-40"
                        title="Remove profile photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-teal-800">
                    {userData.name} {userData.lastName}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {userData.role} | Lab Course.
                  </p>
                </div>
              </div>
              <div className="border-b border-teal-200"></div>
            </div>
            
            {/* Password Reset Section */}
            {showPasswordSection && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-teal-700">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {passwordError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      {passwordSuccess}
                    </div>
                  )}
                  <div className="flex flex-col md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500" htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        required
                      />
                    </div>
                    <div></div>
                    <div>
                      <label className="block text-gray-500" htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500" htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
                <div className="mt-4 border-b border-teal-200"></div>
              </div>
            )}
            
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-teal-700">Personal Information</h2>
              {editing ? (
                <form onSubmit={handleSubmit}>
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
                        <label className="block text-gray-500" htmlFor="birthday">Birthday</label>
                        <input
                          type="date"
                          id="birthday"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-500" htmlFor="gender">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-gray-500">Email address</p>
                        <p className="font-medium text-gray-800">{userData.email}</p>
                      </div>
                      <div>
                        <label className="block text-gray-500" htmlFor="number">Phone</label>
                        <input
                          type="text"
                          id="number"
                          name="number"
                          value={formData.number}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        />
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-500">Bio</p>
                        <p className="font-medium text-gray-800">{userData.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address Section */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-teal-700">Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-500" htmlFor="country">Country</label>
                        <select
                          id="country"
                          name="country"
                          value={selectedCountry}
                          onChange={handleCountryChange}
                          className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        >
                          <option value="">Select Country</option>
                          {countryList.map((country) => (
                            <option key={country.country} value={country.country}>
                              {country.country}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-500" htmlFor="city">City/State</label>
                        <select
                          id="city"
                          name="city"
                          value={selectedCity}
                          onChange={handleCityChange}
                          disabled={!selectedCountry}
                          className="w-full p-2 rounded border bg-white border-teal-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        >
                          <option value="">Select City</option>
                          {cityList.map((city, index) => (
                            <option key={index} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
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
                        <p className="font-medium text-gray-800">
                          {userData.birthday ? new Date(userData.birthday).toLocaleDateString() : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-500">Gender</p>
                        <p className="font-medium text-gray-800">{userData.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email address</p>
                        <p className="font-medium text-gray-800">{userData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">{userData.number || 'Not specified'}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-500">Bio</p>
                        <p className="font-medium text-gray-800">{userData.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address Section */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-teal-700">Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">Country</p>
                        <p className="font-medium text-gray-800">{userData.country || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">City/State</p>
                        <p className="font-medium text-gray-800">{userData.city || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="border-b border-teal-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;