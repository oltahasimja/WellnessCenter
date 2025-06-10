// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5001/api/auth/forgot-password',
        { email }
      );
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Nuk ka llogari me këtë email');
      } else {
        setError(err.response?.data?.message || 'Diçka shkoi keq');
      }
      setMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 bg-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center dark:text-white">
          Forgot Password
        </h2>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {message && (
            <div className="p-4 text-green-700 bg-green-100 rounded-md">
              {message}
            </div>
          )}

{error && (
  <div className="p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
    {error}
  </div>
)}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Send Reset Link
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;