import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const UsersGroup = () => {
  const [formData, setFormData] = useState({});
  const [usersgroupList, setUsersGroupList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { theme, setTheme } = useTheme();

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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchUsersGroups(),
          fetchUsers(),
          fetchGroups()
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = usersgroupList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(usersgroupList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchUsersGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/usersgroup');
      setUsersGroupList(response.data);
    } catch (error) {
      console.error("Error fetching users groups:", error);
      setError('Failed to fetch users groups');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/user');
      setUserList(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError('Failed to fetch users');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/group');
      setGroupList(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError('Failed to fetch groups');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`http://localhost:5001/api/usersgroup/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:5001/api/usersgroup', formData);
      }
      
      await fetchUsersGroups();
      setFormData({});
      setCurrentPage(1); // Reset to first page after modification
    } catch (error) {
      console.error("Error saving users group:", error);
      setError(error.response?.data?.message || 'Failed to save users group');
    }
  };

  const handleEdit = (item) => {
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData(editData);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user group association?')) {
      try {
        await axios.delete(`http://localhost:5001/api/usersgroup/${id}`);
        await fetchUsersGroups();
        // Adjust page if we deleted the last item on the page
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error("Error deleting users group:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl dark:text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-500 dark:text-red-400">Error</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-0">Users Group Management</h1>
            <ThemeSwitcher />
          </div>
          
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <input 
              type="number"
              placeholder="id"
              value={formData.id || ''}
              onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })}
              className="hidden"
            />
                  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User</label>
                <select
                  value={formData.userId || ''}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="" disabled className="dark:bg-gray-700">Select User</option>
                  {userList.map((item) => (
                    <option 
                      key={item.mysqlId || item.id} 
                      value={item.mysqlId || item.id}
                      className="dark:bg-gray-700"
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group</label>
                <select
                  value={formData.groupId || ''}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="" disabled className="dark:bg-gray-700">Select Group</option>
                  {groupList.map((item) => (
                    <option 
                      key={item.mysqlId || item.id} 
                      value={item.mysqlId || item.id}
                      className="dark:bg-gray-700"
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-semibold text-lg transition-colors shadow-sm"
            >
              {formData.id ? 'Update' : 'Add'}
            </button>
          </form>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm mb-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Group
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.userId?.name || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.groupId?.name || 'Unknown Group'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex justify-center space-x-2">
                          {/* <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
                          >
                            Edit
                          </button> */}
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
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {usersgroupList.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, usersgroupList.length)}
                </span>{' '}
                of <span className="font-medium">{usersgroupList.length}</span> results
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

export default UsersGroup;