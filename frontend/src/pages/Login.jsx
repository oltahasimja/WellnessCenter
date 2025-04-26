import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ThemeSwitcher from "../components/ThemeSwitcher"; 
import useAuthCheck from '../hook/useAuthCheck'; 
import { FaArrowLeft, FaHome } from 'react-icons/fa';

const Login = () => {
  const { isChecking, isAuthenticated } = useAuthCheck();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
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
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (error.response && error.response.status === 401) {
        setErrorMessage('username ose password janë gabim. Ju lutem provoni përsëri.');
      } else {
        setErrorMessage('Gabim gjatë login. Ju lutem provoni përsëri.');
      }
      
      // After 3 failed attempts, redirect to forgot password
      if (newAttempts >= 3) {
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      }
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

        <div id="back-div" className="bg-gradient-to-r from-teal-400 to-teal-700 rounded-[26px] m-4">
          <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2">
            <h1 className="pt-8 pb-6 font-bold text-5xl text-teal-500 dark:text-teal-400 text-center cursor-default">
              Login
            </h1>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{errorMessage}</p>
                {loginAttempts >= 2 && (
                  <p className="mt-2">Pasi provuat disa herë, do të ridrejtoheni te faqja për të rivendosur fjalëkalimin.</p>
                )}
              </div>
            )}
            
            {message && (
              <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
                <p>{message}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 dark:text-gray-400 text-lg">username</label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-3 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                  type="username"
                  placeholder="username"
                  required
                />
              </div>
              <div className="relative">
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border dark:bg-teal-700 dark:text-gray-300 dark:border-gray-700 p-3 pr-10 mb-2 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-.443.03-.878.088-1.305m19.524 7.53A9.964 9.964 0 0022 9c0-5.523-4.477-10-10-10S2 3.477 2 9c0 1.676.411 3.255 1.133 4.635" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.337 1.173-.844 2.264-1.492 3.24M15.75 15.75L20.25 20.25M3.75 3.75L8.25 8.25" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                className="bg-gradient-to-r from-teal-500 to-teal-700 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-teal-500 hover:to-teal-500 transition duration-300 ease-in-out"
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

            <div className="flex items-center justify-center mt-1">
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
                <a className="group text-blue-400 transition-all duration-100 ease-in-out pr-1 pl-1" href="#">
                  <span className="cursor-pointer bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                    Terms
                  </span>
                </a>
                and
                <a className="group text-blue-400 transition-all duration-100 ease-in-out pr-1 pl-1" href="#">
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