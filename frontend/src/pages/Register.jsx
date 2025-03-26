import React, { useState } from 'react';
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
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/user', formData, { withCredentials: true });
            setMessage('Regjistrimi ishte i suksesshëm.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } catch (error) {
            if (error.response) {
                console.error('Error during registration:', error.response.data);
                setMessage(`Gabim gjatë regjistrimit: ${error.response.data.error || error.response.data.message}`);
            } else {
                console.error('Error during registration:', error.message);
                setMessage('Gabim gjatë regjistrimit.');
            }
        }
    };

    return (
        <div className="flex font-poppins items-center justify-center dark:bg-gray-900 min-w-screen min-h-screen">
            <div className="grid gap-8 w-full max-w-2xl"> {/* E bërë më e gjerë */}
                
                {/* Dark/Light Mode Toggle */}
                <div className="absolute top-5 right-5 z-10">
                    <ThemeSwitcher />
                </div>

                <div id="back-div" className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4">
                    <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-12 lg:p-12 md:p-10 sm:p-6 p-4 m-2">
                        <h1 className="pt-6 pb-4 font-bold text-5xl dark:text-gray-400 text-center cursor-default">
                            Register
                        </h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {['name', 'lastName', 'number', 'email', 'username'].map((field, index) => (
                                <div className="mb-5" key={index}>
                                    <label className="mb-2 dark:text-gray-400 text-lg block" htmlFor={field}>
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </label>
                                    <input
                                        type={field === 'number' ? 'tel' : field === 'email' ? 'email' : 'text'}
                                        id={field}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-4 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                                        placeholder={`Shkruani ${field}`}
                                        required
                                    />
                                </div>
                            ))}

                            <button
                                className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg mt-6 p-3 text-white text-lg rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out"
                                type="submit"
                            >
                                Register
                            </button>
                        </form>
                        <div className="flex flex-col mt-4 items-center justify-center text-sm">
                            <h3>
                                <span className="cursor-default dark:text-gray-300">Already have an account?</span>
                                <a className="group text-blue-400 transition-all duration-100 ease-in-out" href="/login">
                                    <span className="bg-left-bottom ml-1 bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                                        Login
                                    </span>
                                </a>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
