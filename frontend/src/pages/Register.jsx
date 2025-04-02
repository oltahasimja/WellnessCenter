import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ThemeSwitcher from "../components/ThemeSwitcher";

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

    const [countryList, setCountryList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

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
    };

    const handleCountryChange = (e) => {
        const country = e.target.value;
        setSelectedCountry(country);
        setFormData((prev) => ({ ...prev, country })); 

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
        setFormData({ ...formData, city: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/user', formData, { withCredentials: true });
            setMessage('Regjistrimi ishte i suksesshëm.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } catch (error) {
            setMessage('Gabim gjatë regjistrimit.');
        }
    };

    return (
        <div className="flex font-poppins items-center justify-center dark:bg-gray-900 min-w-screen min-h-screen">
            <div className="grid gap-8 w-full max-w-2xl">
                <div className="absolute top-5 right-5 z-10">
                    <ThemeSwitcher />
                </div>
                <div id="back-div" className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4">
                    <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-12 lg:p-12 md:p-10 sm:p-6 p-4 m-2">
                        <h1 className="font-bold text-5xl dark:text-gray-400 text-center">Register</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex gap-4">
                                {['name', 'lastName'].map((field) => (
                                    <div className="w-1/2 mb-5" key={field}>
                                        <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor={field}>
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </label>
                                        <input
                                            type={field === 'number' ? 'tel' : field === 'email' ? 'email' : 'text'}
                                            id={field}
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                        <div className="flex gap-4">
                            {['number', 'username'].map((field) => (
                                <div className="w-1/2 mb-5" key={field}>
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor={field}>
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </label>
                                    <input
                                        type={field === 'number' ? 'tel' : field === 'email' ? 'email' : 'text'}
                                        id={field}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            {['email'].map((field) => (
                                <div className="w-full mb-5" key={field}>
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor={field}>
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </label>
                                    <input
                                        type={field === 'number' ? 'tel' : field === 'email' ? 'email' : 'text'}
                                        id={field}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                    />
                                </div>
                            ))}
                        </div>


                            {/* Gender and Birthday inputs in one row */}
                            <div className="flex gap-4">
                                {/* Gender select */}
                                <div className="w-1/2">
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor="gender">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Birthday input */}
                                <div className="w-1/2">
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor="birthday">Birthday</label>
                                    <input
                                        type="date"
                                        id="birthday"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Country and City inputs in one row */}
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="mb-2 dark:text-gray-400 text-lg block">Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleCountryChange}
                                        className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md border-gray-300 rounded-lg w-full"
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
                                        className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md border-gray-300 rounded-lg w-full"
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

                            <button className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg mt-2 p-3 text-white text-lg rounded-lg w-full hover:scale-105 transition" type="submit">
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
        </div>
    );
}

export default Register;
