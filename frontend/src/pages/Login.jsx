import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ThemeSwitcher from "../components/ThemeSwitcher"; 
import useAuthCheck from '../hook/useAuthCheck'; 


const Login = () => {
  const { isChecking, isAuthenticated } = useAuthCheck();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    if (isChecking) {
      return (
        <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 bg-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      );
    }
    
  
    if (isAuthenticated) return <Navigate to="/dashboard" />;


      
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:5000/api/login/login',
                { username, password }
            );

            setMessage('Login ishte i suksesshëm.');
            localStorage.setItem('isLoggedIn', true); 
            navigate('/dashboard'); 

        } catch (error) {
            console.error('Gabim gjatë login:', error);
            setMessage('Gabim gjatë login.');
        }
    };
  
  
    const handleGoogleSuccess = async (credentialResponse) => {
      try {
          const response = await axios.post(
              'http://localhost:5000/api/login/auth/google',
              { token: credentialResponse.credential },
              { withCredentials: true }
          );
          localStorage.setItem('isLoggedIn', true);
          navigate('/dashboard');
      } catch (error) {
          console.error('Google login error:', error);
          setMessage('Gabim gjatë Google login.');
      }
  };

  const handleGoogleError = () => {
      setMessage('Google authentication failed.');
  };
    

  return (
    <div className="flex font-poppins items-center justify-center dark:bg-gray-900 min-w-screen min-h-screen">
    <div className="grid gap-8 w-full max-w-2xl">
        <div className="absolute top-5 right-5 z-10">
            <ThemeSwitcher />
        </div>

        <div id="back-div" className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4">
            <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2">
                <h1 className="pt-8 pb-6 font-bold text-5xl dark:text-gray-400 text-center cursor-default">
                    Login
                </h1>
                
              

                
            <form  onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 dark:text-gray-400 text-lg">username</label>
                <input
                  id="username"
                  value={username}
                   onChange={(e) => setUsername(e.target.value)}
                  className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                  type="username"
                  placeholder="username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 dark:text-gray-400 text-lg">Password</label>
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 mb-2 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out"
                type="submit"
              >
                Login
              </button>
            </form>
            <div className="flex flex-col mt-4 items-center justify-center text-sm">
              <h3>
                <span className="cursor-default dark:text-gray-300">Don't have an account?</span>
                <a className="group text-blue-400 transition-all duration-100 ease-in-out" href="/register">
                  <span className="bg-left-bottom ml-1 bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                    Sign Up
                  </span>
                </a>
              </h3>
            </div>

            <div className="flex items-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

            <div className="mb-6 flex justify-center">
                    <GoogleOAuthProvider clientId="1016284796883-v35r8shq8612a0bnvrac6hcudquqoeo7.apps.googleusercontent.com">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            text="continue_with"
                            shape="rectangular"
                            size="large"
                            width="300"
                        />
                    </GoogleOAuthProvider>
                </div>

                <div className=" flex items-center justify-center mt-1">
                        <button 
                          type="button"
                          onClick={() => navigate('/forgot-password')}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          Forgot password?
                        </button>
                      </div>
            <div className="text-gray-500 flex text-center flex-col mt-4 items-center text-sm">
              <p className="cursor-default">
                By signing in, you agree to our
                <a className="group text-blue-400 transition-all duration-100 ease-in-out" href="#">
                  <span className="cursor-pointer bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                    Terms
                  </span>
                </a>
                and
                <a className="group text-blue-400 transition-all duration-100 ease-in-out" href="#">
                  <span className="cursor-pointer bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                    Privacy Policy
                  </span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
