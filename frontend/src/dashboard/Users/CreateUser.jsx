import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useTheme } from "../../components/ThemeContext";

const CreateUser = ({ setActiveComponent }) => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [roleList, setRoleList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    fetchRoles();
    fetchCountries();
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/${id}`);
      setFormData(response.data);
      setSelectedCountry(response.data.country || "");
      setSelectedCity(response.data.city || "");
      setGender(response.data.gender || ""); 
      setBirthday(response.data.birthday || "");
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/role");
      setRoleList(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

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
        console.error(`Tentativa ${i + 1} për të marrë shtetet dështoi:`, error);
      }
    }
  };
  

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setFormData((prev) => ({ ...prev, country })); 
  
    if (!countryList.length) {
      console.warn("Lista e shteteve është bosh, duke rifreskuar...");
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
    setFormData((prev) => ({ ...prev, city })); 
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = { 
        ...formData, 
        country: selectedCountry, 
        city: selectedCity,
        gender: gender,
        birthday: birthday 
      };
  
      if (id) {
        await axios.put(`http://localhost:5000/api/user/${id}`, userData);
      } else {
        await axios.post("http://localhost:5000/api/user", userData);
      }
      
      navigate("/dashboard/users"); 
      // setActiveComponent("user"); 



    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* <Navbar /> */}
      <div className="flex flex-1 mb-[2rem]">
        {/* <Sidebar /> */}
        <div className={`p-6 flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={`shadow-xl rounded-lg p-8 w-full max-w-4xl ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}>
              <h1 className={`text-4xl font-bold text-center mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                {id ? "Edit User" : "Create New User"}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Number"
                    value={formData.number || ""}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username || ""}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                    required
                  />

                  <div>
                    <label className={`block text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                      required
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Birthday
                    </label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </label>
                    <select
                      value={formData.roleId || ""}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                      className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                      required
                    >
                      <option value="" disabled>Select Role</option>
                      {roleList.map((item) => (
                        <option key={item.mysqlId} value={item.mysqlId}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Country
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                      required
                    >
                      <option value="" disabled>Select Country</option>
                      {countryList.map((country) => (
                        <option key={country.country} value={country.country}>
                          {country.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={handleCityChange}
                      className={`border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white border-gray-300'}`}
                      required
                      disabled={!cityList.length}
                    >
                      <option value="" disabled>Select City</option>
                      {cityList.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/dashboard/users");
                      // setActiveComponent("user");
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
                  >
                    {id ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;