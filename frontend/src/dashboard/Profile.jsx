import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';
import { useTheme } from "../components/ThemeContext";

function Profile() {
  const { theme } = useTheme();
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
  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();

  const fetchCountries = async (retryCount = 3) => {
    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await axios.get("https://countriesnow.space/api/v0.1/countries");
        if (response.data && response.data.data) {
          setCountryList(response.data.data);
          return;
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
    setFormData((prev) => ({ ...prev, country }));

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
      const countryData = countryList.find((c) => c.country === country);
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
        const response = await axios.get('http://localhost:5000/user', {
          withCredentials: true
        });
        
        if (response.data.user) {
          setUserData(response.data.user);
          const user = response.data.user;
          setFormData({
            birthday: user.birthday ? user.birthday.split('T')[0] : '',
            gender: user.gender || '',
            number: user.number || '',
            country: user.country || '',
            city: user.city || ''
          });
          
          // Set selected country and city
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
        const base64Image = reader.result;
        await axios.put(`http://localhost:5000/api/user/${userData.id}`, {
          profileImage: base64Image
        }, {
          withCredentials: true
        });
        
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

  // const handleEditToggle = () => {
  //   setEditing(!editing);
  // };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the correct ID - check both possible ID fields
      const userId = userData.id || userData.mysqlId;
      if (!userId) {
        throw new Error('User ID not found');
      }
  
      await axios.put(`http://localhost:5000/api/user/${userId}`, {
        birthday: formData.birthday,
        gender: formData.gender,
        number: formData.number,
        country: formData.country,
        city: formData.city
      }, {
        withCredentials: true
      });
  
      // Refresh user data
      const response = await axios.get('http://localhost:5000/user', {
        withCredentials: true
      });
      setUserData(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to update profile: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 mb-[2rem]">
          <Sidebar />
          <div className={`p-6 flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
            <div className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Loading...</div>
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
          <div className={`p-6 flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
            <div className="text-lg text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${userData.name?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`;

  return (
    <div className="h-screen flex flex-col">
      {/* <Navbar /> */}
      <div className="flex flex-1 mb-[2rem]">
        {/* <Sidebar /> */}
        <div className={`p-6 flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className={`max-w-10xl mx-auto p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            {/* Header with Edit Button */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Profile</h1>
                <div className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}></div>
              </div>
              <button
           onClick={() => handleEditToggle(userData)}
        className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Section */}
            <div className="mb-8">
              {/* <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Profile</h2> */}
              <div className="flex items-center mb-6">
                <div className="relative group">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-md ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    {userData.profileImage ? (
                      <img 
                        src={userData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
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
                  <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {userData.name} {userData.lastName}
                  </h3>
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {userData.role} | Lab Course.
                  </p>
                </div>
              </div>
              <div className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}></div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Personal Information</h2>
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-4">
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Username</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.username}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>First Name</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.name}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Name</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.lastName}</p>
                      </div>
                      <div>
                        <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="birthday">Birthday</label>
                        <input
                          type="date"
                          id="birthday"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="gender">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email address</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.email}</p>
                      </div>
                      <div>
                        <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="number">Phone</label>
                        <input
                          type="text"
                          id="number"
                          name="number"
                          value={formData.number}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="mb-4">
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Bio</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address Section */}
                  <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
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
                <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="city">City/State</label>
                <select
                  id="city"
                  name="city"
                  value={selectedCity}
                  onChange={handleCityChange}
                  disabled={!selectedCountry}
                  className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
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
                      className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
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
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Username</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.username}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>First Name</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.name}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Name</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.lastName}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Birthday</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {userData.birthday ? new Date(userData.birthday).toLocaleDateString() : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Gender</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email address</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.email}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.number || 'Not specified'}</p>
                      </div>
                      <div className="mb-4">
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Bio</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address Section */}
                  <div>
                    <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Country</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.country || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>City/State</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.city || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;