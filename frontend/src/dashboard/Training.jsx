import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Training = () => {
  const [formData, setFormData] = useState({});
  const [trainingList, setTrainingList] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Duration options
  const durationOptions = [
    '1 muaj',
    '2 muaj',
    '3 muaj', 
    '4 muaj',
    '5 muaj',
    '6 muaj',
    '1 vit'
  ];

  // Theme switcher component
  const ThemeSwitcher = () => (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      {theme === "dark" ? (
        <FaSun className="text-yellow-400" />
      ) : (
        <FaMoon className="text-gray-700" />
      )}
    </button>
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5001/user', { withCredentials: true });
        if (!userResponse.data.user) {
          navigate('/login');
          return;
        }
        setUser(userResponse.data.user);
        await fetchTrainings();
      } catch (error) {
        console.error('Error initializing data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [navigate]);

  const fetchTrainings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/training', {
        withCredentials: true
      });
      
      const trainingsWithCreator = response.data.map(training => {
        if (training.createdById && typeof training.createdById === 'object') {
          return {
            ...training,
            creatorDisplayName: `${training.createdById.name} ${training.createdById.lastName || ''}`.trim()
          };
        }
        return {
          ...training,
          creatorDisplayName: training.creatorName || 'Unknown'
        };
      });
  
      setTrainingList(trainingsWithCreator);
    } catch (error) {
      console.error('Error fetching trainings:', error.response?.data || error.message);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = trainingList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(trainingList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
  
    try {
      const dataToSend = { 
        ...formData, 
        createdById: user.id
      };
  
      if (formData.id) {
        await axios.put(`http://localhost:5001/api/training/${formData.id}`, dataToSend);
      } else {
        await axios.post('http://localhost:5001/api/training', dataToSend);
      }
  
      await fetchTrainings();
      setFormData({});
      setCurrentPage(1);
    } catch (error) {
      console.error('Error saving training:', error.response?.data || error.message);
      if (error.response?.data?.message === 'User not found in MongoDB') {
        alert('User synchronization error. Please try again or contact support.');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      id: item.mysqlId || item.id
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/training/${id}`);
      await fetchTrainings();
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  };

  const handleParticipantsChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), 1), 10);
    setFormData({ ...formData, max_participants: value });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-0">Training Management</h1>
            <ThemeSwitcher />
          </div>
          
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text"
                  id="title"
                  placeholder="Training title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input 
                  type="text"
                  id="category"
                  placeholder="Training category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input 
                  type="text"
                  id="description"
                  placeholder="Training description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                <select
                  id="duration"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="" disabled className="dark:bg-gray-700">Select duration</option>
                  {durationOptions.map((option, index) => (
                    <option key={index} value={option} className="dark:bg-gray-700">{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Participants</label>
                <input 
                  type="number"
                  id="participants"
                  placeholder="Max participants"
                  value={formData.max_participants || ''}
                  onChange={handleParticipantsChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-semibold text-lg transition-colors shadow-sm"
              >
                {formData.id ? 'Update Training' : 'Add Training'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm mb-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Max Participants
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.mysqlId || item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/training/${item.mysqlId || item.id}`} 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={item.description}>
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.creatorDisplayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.max_participants}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.mysqlId || item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No trainings found. Create your first training!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {trainingList.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, trainingList.length)}
                </span>{' '}
                of <span className="font-medium">{trainingList.length}</span> trainings
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 border rounded-md text-sm ${currentPage === number ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;