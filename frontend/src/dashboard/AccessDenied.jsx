import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';
import { useTheme } from "../components/ThemeContext";

const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`p-8 rounded-lg shadow-lg max-w-md w-full text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 text-red-500 mb-6">
          <ShieldX size={48} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Home size={16} className="mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;