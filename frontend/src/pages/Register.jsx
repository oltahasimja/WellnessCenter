import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ThemeSwitcher from "../components/ThemeSwitcher";
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        number: '',
        email: '',
        username: '',
        roleId: '1',
        country: '',
        city: '',
        gender: '', 
        birthday: '' 
    });
    const [validation, setValidation] = useState({
        username: { available: null, checking: false },
        email: { available: null, checking: false }
    });
    const [countryList, setCountryList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Debounce function
    const debounce = (func, delay) => {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Check identifier (username or email) availability
    const checkIdentifier = useCallback(debounce(async (type, value) => {
        if (!value || (type === 'username' && value.length < 3)) {
            setValidation(prev => ({ ...prev, [type]: { available: null, checking: false } }));
            return;
        }

        setValidation(prev => ({ ...prev, [type]: { ...prev[type], checking: true } }));
        
        try {
            const response = await axios.get(`http://localhost:5000/api/login/check/${value}`);
            
            if (response.data.exists) {
                const isCurrentType = response.data.type === type;
                setValidation(prev => ({ 
                    ...prev, 
                    [type]: { available: !isCurrentType, checking: false } 
                }));
            } else {
                setValidation(prev => ({ 
                    ...prev, 
                    [type]: { available: true, checking: false } 
                }));
            }
        } catch (error) {
            console.error(`Error checking ${type}:`, error);
            setValidation(prev => ({ ...prev, [type]: { available: null, checking: false } }));
        }
    }, 500), []);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get("https://countriesnow.space/api/v0.1/countries", {
                    withCredentials: false 
                });
                if (response.data?.data) {
                    setCountryList(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountries();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (name === 'username') {
            setValidation(prev => ({ ...prev, username: { available: null, checking: false } }));
            checkIdentifier('username', value);
        }
        
        if (name === 'email') {
            setValidation(prev => ({ ...prev, email: { available: null, checking: false } }));
            if (value.includes('@') && value.includes('.')) {
                checkIdentifier('email', value);
            }
        }
    };

    const handleCountryChange = (e) => {
        const country = e.target.value;
        setSelectedCountry(country);
        setFormData(prev => ({ ...prev, country })); 

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
        setFormData(prev => ({ ...prev, city: "" }));
    };

    const handleCityChange = (e) => {
        setFormData({ ...formData, city: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate before submission
        if (validation.username.available === false) {
            setMessage('Please choose a different username');
            return;
        }
        
        if (validation.email.available === false) {
            setMessage('This email is already registered');
            return;
        }
        
        if ((validation.username.checking || validation.email.checking) || 
            (validation.username.available === null && formData.username.length >= 3) ||
            (validation.email.available === null && formData.email.includes('@'))) {
            setMessage('Please wait while we validate your information');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/user', formData, { withCredentials: true });
            setIsSubmitted(true);
        } catch (error) {
            setMessage('Error during registration: ' + (error.response?.data?.message || error.message));
        }
    };

    const renderValidationStatus = (type) => {
        const { available, checking } = validation[type];
        
        if (checking) {
            return <p className="text-sm text-gray-500 mt-1">Checking {type}...</p>;
        }
        if (available === true) {
            return <p className="text-sm text-green-500 mt-1">{type.charAt(0).toUpperCase() + type.slice(1)} is available!</p>;
        }
        if (available === false) {
            return <p className="text-sm text-red-500 mt-1">{type.charAt(0).toUpperCase() + type.slice(1)} is already taken</p>;
        }
        return null;
    };

    return (
        <div className="flex font-poppins items-center justify-center dark:bg-gray-900 min-w-screen min-h-screen">
            <div className="grid gap-8 w-full max-w-2xl">
        {/* Back to Home button */}
                    <div className="absolute top-5 left-5 z-10">
                    <Link 
                        to="/" 
                        className="flex items-center space-x-2 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-blue-300 transition-colors duration-300"
                    >
                        <FaArrowLeft className="text-lg" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    </div>
                <div className="absolute top-5 right-5 z-10">
                    <ThemeSwitcher />
                </div>
                <div id="back-div" className="bg-gradient-to-r from-teal-400 to-teal-700  rounded-[26px] m-4">
                    <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-12 lg:p-12 md:p-10 sm:p-6 p-4 m-2">
                        <h1 className="font-bold text-5xl text-teal-500 mb-2 dark:text-teal-400 text-center">Register</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name and Last Name */}
                            <div className="flex gap-4">
                                {['name', 'lastName'].map((field) => (
                                    <div className="w-1/2 mb-5" key={field}>
                                        <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor={field}>
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </label>
                                        <input
                                            type="text"
                                            id={field}
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Number and Username */}
                            <div className="flex gap-4">
                                <div className="w-1/2 mb-5">
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor="number">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="number"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleChange}
                                        className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                    />
                                </div>
                                <div className="w-1/2 mb-5">
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor="username">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                        minLength="3"
                                    />
                                    {renderValidationStatus('username')}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mb-5">
                                <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                    required
                                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    title="Please enter a valid email (e.g. example@gmail.com)"
                                />
                                {renderValidationStatus('email')}
                            </div>

                            {/* Gender and Birthday */}
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor="gender">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor="birthday">Birthday</label>
                                    <input
                                        type="date"
                                        id="birthday"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Country and City */}
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="mb-2 dark:text-gray-400 text-lg block">Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleCountryChange}
                                        className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md border-gray-300 rounded-lg w-full"
                                        required
                                    >
                                        <option value="">Select a country</option>
                                        {countryList.map((country, index) => (
                                            <option key={index} value={country.country}>{country.country}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="mb-2 dark:text-gray-400 text-lg block">City</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleCityChange}
                                        className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md border-gray-300 rounded-lg w-full"
                                        required
                                        disabled={!formData.country}
                                    >
                                        <option value="">Select a city</option>
                                        {cityList.map((city, index) => (
                                            <option key={index} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button 
                                className="bg-gradient-to-r from-teal-400 to-teal-700 shadow-lg mt-2 p-3 text-white text-lg rounded-lg w-full hover:scale-105 transition" 
                                type="submit"
                                disabled={
                                    validation.username.available === false || 
                                    validation.email.available === false ||
                                    validation.username.checking || 
                                    validation.email.checking
                                }
                            >
                                Register
                            </button>
                        </form>
                        {message && <p className="text-center mt-4 text-red-500">{message}</p>}
                        <div className="flex flex-col mt-4 items-center text-sm">
                            <h3>
                                <span className="cursor-default dark:text-gray-300">Already have an account?</span>
                                <a className="text-blue-400 ml-1" href="/login">Login</a>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {isSubmitted && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">Thank You!</h2>
                        <p className="dark:text-gray-300">Your submission was successful.</p>
                        <p className="dark:text-gray-300 mt-2">You will receive your password in your registered email.</p>
                        <button
                            onClick={() => {
                                setIsSubmitted(false);
                                window.location.href = '/login';
                            }}
                            className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;