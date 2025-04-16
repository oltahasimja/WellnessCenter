import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from "../../components/ThemeContext";

function EditUser({ setActiveComponent }) {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleList, setRoleList] = useState([]);
  const [dashboardroleList, setDashboardRoleList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    number: '',
    email: '',
    username: '',
    country: '',
    city: '',
    birthday: '',
    gender: '',
    roleId: '',
    dashboardRoleId: ''
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const fetchCities = async (country) => {
    try {
      const response = await axios.post("https://countriesnow.space/api/v0.1/countries/cities", {
        withCredentials: false,
        country: country
      });
      if (response.data && response.data.data) {
        setCityList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = localStorage.getItem('editUserId');
        if (!id) return;
        
        const [userResponse, rolesResponse, dashboardroleList] = await Promise.all([
          axios.get(`http://localhost:5000/api/user/${id}`),
          axios.get("http://localhost:5000/api/role"),
          axios.get("http://localhost:5000/api/dashboardrole")
        ]);
        
        setUserData(userResponse.data);
        setRoleList(rolesResponse.data);
        setDashboardRoleList(dashboardroleList.data);
        
        // Extract country and city from their respective objects
        const country = userResponse.data.countryId?.name || '';
        const city = userResponse.data.cityId?.name || '';
        
        setFormData({
          name: userResponse.data.name,
          lastName: userResponse.data.lastName,
          number: userResponse.data.number,
          email: userResponse.data.email,
          username: userResponse.data.username,
          country: country, // Set country from countryId object
          city: city, // Set city from cityId object
          birthday: userResponse.data.birthday ? userResponse.data.birthday.split('T')[0] : '',
          gender: userResponse.data.gender,
          roleId: userResponse.data.roleId?.mysqlId || userResponse.data.roleId,
          dashboardRoleId: userResponse.data.dashboardRoleId?.mysqlId || userResponse.data.dashboardRoleId,
          profileImage: userResponse.profileImageId || null
        });
        
        // Update the selected country and city
        setSelectedCountry(country);
        setSelectedCity(city);
        
        // If we have a country, fetch its cities
        if (country) {
          fetchCities(country);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        setErrorMessage('Failed to load data');
      }
    };
    
    fetchData();
    fetchCountries();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jfif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select an image in JPEG, PNG, or JFIF format');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result.split(',')[1]; // Remove the data URL header
        
        // Update the user's profile image
        await axios.put(`http://localhost:5000/api/user/${userData._id}`, {
          profileImage: base64Image
        }, {
          withCredentials: true
        });
        
        // Refresh user data
        const response = await axios.get(`http://localhost:5000/api/user/${userData._id}`, {
          withCredentials: true
        });
        setUserData(response.data);
        setSuccessMessage('Profile image updated successfully!');
      } catch (error) {
        console.error('Error updating profile image:', error);
        setErrorMessage('Failed to update profile image');
      }
    };
    reader.readAsDataURL(file);
  };

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

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setFormData(prev => ({
      ...prev,
      city: city
    }));
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
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const id = localStorage.getItem('editUserId');
      if (!id) {
        throw new Error('User ID not found');
      }
      
      const dataToSubmit = { ...formData };
      
      if (selectedCountry && selectedCountry !== userData.countryId?.name) {
        try {
          const countryResponse = await axios.get(`http://localhost:5000/api/country/byName/${selectedCountry}`);
          if (countryResponse.data && countryResponse.data._id) {
            dataToSubmit.countryId = countryResponse.data._id;
          }
        } catch (countryError) {
          console.error('Error fetching country ID:', countryError);
        }
      }
      
      if (selectedCity && selectedCity !== userData.cityId?.name) {
        try {
          const cityResponse = await axios.get(`http://localhost:5000/api/city/byName/${selectedCity}`);
          if (cityResponse.data && cityResponse.data._id) {
            dataToSubmit.cityId = cityResponse.data._id;
        
          }
        } catch (cityError) {
          console.error('Error fetching city ID:', cityError);
        }
      }
      
      await axios.put(`http://localhost:5000/api/user/${id}`, dataToSubmit);
      setSuccessMessage('Të dhënat u përditësuan me sukses!');
      
      setTimeout(() => {
        setSuccessMessage('');
        // setActiveComponent("user");
      }, 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage('Gabim gjatë përditësimit të të dhënave');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>User not found</div>;
  }

  const initials = userData.name && userData.lastName 
    ? `${userData.name.charAt(0)}${userData.lastName.charAt(0)}` 
    : '';

    const handleRemovePhoto = async () => {
      try {
        const userId = userData.id || userData.mysqlId;
        if (!userId) {
          throw new Error('User ID not found');
        }
    
        await axios.put(`http://localhost:5000/api/user/${userId}`, {
          profileImage: null
        }, {
          withCredentials: true
        });
        
        const response = await axios.get('http://localhost:5000/user', {
          withCredentials: true
        });
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error removing profile image:', error);
        // setError('Failed to remove profile image');
      }
    };
    


  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 mb-[2rem]">
        <div className={`p-6 flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className={`max-w-10xl mx-auto p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            {/* Shfaq mesazhet e suksesit/gabimit */}
            {successMessage && (
              <div className={`mb-4 p-4 rounded-md ${theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'}`}>
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className={`mb-4 p-4 rounded-md ${theme === 'dark' ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'}`}>
                {errorMessage}
              </div>
            )}

            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Edit User</h1>
                <div className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}></div>
              </div>
              <button
                onClick={() => {
                  navigate("/dashboard/users");
                  // setActiveComponent("user");
                }}
                className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Back to Users
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-6">
              <div className="relative group">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-md ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    {userData.profileImageId ? (
                      <img 
                        src={`data:image/jpeg;base64,${userData.profileImageId}`}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
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
                    {userData.profileImageId && (
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
                  <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {userData.name} {userData.lastName}
                  </h3>
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {userData.roleId?.name || 'No role assigned'}
                  </p>
                </div>
              </div>
              <div className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}></div>
            </div>


            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="name">First Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
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
                    <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="email">Email address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                    />
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
                  <div>
            <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="roleId">Role</label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
            >
              {userData?.roleId && (
                <option value={userData.roleId.mysqlId || userData.roleId}>
                  {userData.roleId.name}
                </option>
              )}
              
              {roleList
                .filter(role => role.mysqlId !== (userData?.roleId?.mysqlId || userData?.roleId))
                .map(role => (
                  <option key={role.mysqlId || role._id} value={role.mysqlId || role._id}>
                    {role.name}
                  </option>
                ))}
            </select>
          </div>
          {dashboardroleList.length > 0 && (
  <div>
    <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="dashboardRoleId">Dashboard Role</label>
    <div className="flex items-center gap-2">
      <select
        id="dashboardRoleId"
        name="dashboardRoleId"
        value={formData.dashboardRoleId || ''}
        onChange={handleInputChange}
        className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
      >
        <option value="">Select Dashboard Role</option>
        {userData?.dashboardRoleId && (
          <option value={userData.dashboardRoleId.mysqlId || userData.dashboardRoleId}>
            {userData.dashboardRoleId.name}
          </option>
        )}
        
        {dashboardroleList
          .filter(role => role.mysqlId !== (userData?.dashboardRoleId?.mysqlId || userData?.dashboardRoleId))
          .map(role => (
            <option key={role.mysqlId || role._id} value={role.mysqlId || role._id}>
              {role.name}
            </option>
          ))}
      </select>
      {formData.dashboardRoleId && (
        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              dashboardRoleId: null
            }));
          }}
          className={`px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
        >
          Remove Role
        </button>
      )}
    </div>
  </div>
)}
        </div>
                </div>
              
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
                {selectedCountry && (
                  <option value={selectedCountry}>{selectedCountry}</option>
                )}
                {countryList.map((country, index) => (
                  <option key={index} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} htmlFor="city">City</label>
              <select
                id="city"
                name="city"
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedCountry}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="">Select City</option>
                {selectedCity && (
                  <option value={selectedCity}>{selectedCity}</option>
                )}
                {cityList.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/dashboard/users");
                    // setActiveComponent("user");
                  }}                 
                
                className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUser;