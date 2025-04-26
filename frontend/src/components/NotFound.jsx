import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white">
      <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-xl max-w-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Oops! Faqja nuk u gjet</h2>
        <p className="mb-6">Komponenti që po kërkoni nuk ekziston ose nuk është i disponueshëm.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Kthehu në Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Kthehu mbrapa
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;