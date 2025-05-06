import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from "../components/ThemeContext";

const Group = () => {
  const [formData, setFormData] = useState({});
  const [groupList, setGroupList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchCurrentUser();
    fetchGroups();
    fetchUserss();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/user');
      setCurrentUser(response.data.user);
      setFormData(prev => ({ ...prev, createdById: response.data.user.id }));
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/group');
      const transformedGroups = response.data.map(group => ({
        ...group,
        createdById: group.createdById?.id || group.createdById
      }));
      setGroupList(transformedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchUserss = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user');
      setUsersList(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        name: formData.name,
        createdById: currentUser?.id
      };
  
      if (formData.id) {
        await axios.put(`http://localhost:5000/api/group/${formData.id}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/group', dataToSend);
      }
      fetchGroups();
      setFormData({ createdById: currentUser?.id });
    } catch (error) {
      console.error("Error submitting form:", error);
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
    try {
      await axios.delete(`http://localhost:5000/api/group/${id}`);
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Theme classes
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100';
  const cardBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-700';
  const tableHeaderColor = theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600';
  const tableRowHover = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const inputClasses = theme === 'dark' 
    ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' 
    : 'border-gray-300 bg-white text-gray-700 focus:ring-blue-500';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`flex justify-center items-center min-h-screen ${bgColor}`}>
      <div className={`shadow-lg rounded-lg p-6 w-full max-w-3xl ${cardBgColor}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold text-center ${textColor}`}>Group Management</h1>
          {/* <button 
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button> */}
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input 
            type="text"
            placeholder="Group Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`border p-3 rounded-md w-full focus:ring-2 outline-none ${inputClasses}`}
            required
          />
      
          <input 
            type="number"
            placeholder="Creator ID"
            value={formData.createdById || (currentUser?.id || '')}
            onChange={(e) => setFormData({ ...formData, createdById: Number(e.target.value) })}
            className={`border p-3 rounded-md w-full focus:ring-2 outline-none ${inputClasses}`}
            disabled
            hidden
          />

          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Update' : 'Add'}
          </button>
        </form>
        
        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse shadow-md rounded-md overflow-hidden ${cardBgColor}`}>
            <thead>
              <tr className={`uppercase text-sm leading-normal ${tableHeaderColor}`}>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Creator</th>
                <th className="py-3 px-6 text-left">Created At</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`text-sm font-light ${textColor}`}>
              {groupList.length > 0 ? (
                groupList.map((item) => (
                  <tr key={item.mysqlId || item.id} className={`border-b ${borderColor} ${tableRowHover}`}>
                    <td className="py-3 px-6 text-left">{item.name}</td>
                    <td className="py-3 px-6 text-left">
                      {typeof item.createdById === 'object' ? `${item.createdById.name} ${item.createdById.lastName}` : item.createdById}
                    </td>
                    <td className="py-3 px-6 text-left">{formatDate(item.createdAt)}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.mysqlId || item.id)} 
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={`text-center py-4 ${textColor}`}>No groups available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Group;