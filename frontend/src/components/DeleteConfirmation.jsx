import React, { useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';

function DeleteConfirmation({ isOpen, onClose, onConfirm, itemName }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${
          theme === 'dark' ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-60'
        }`}
        onClick={onClose}
      />
      
      <div 
        className="relative transform transition-all duration-300 ease-out sm:max-w-lg w-full mx-4"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0.95)'
        }}
      >
        <div className={`rounded-xl shadow-2xl overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className={`p-4 flex items-start ${
            theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
              theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'
            } sm:mx-0 sm:h-10 sm:w-10`}>
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="mt-1 ml-4 text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Delete confirmation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{itemName}"</span>? 
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              All data will be permanently removed.
            </p>
          </div>
          
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                theme === 'dark' 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              } sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-600 text-gray-200 hover:bg-gray-500 focus:ring-indigo-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500'
              } sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmation;