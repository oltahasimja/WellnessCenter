import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsersGroup = () => {
  const [formData, setFormData] = useState({});
  const [usersgroupList, setUsersGroupList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme on component mount and when theme changes
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    fetchUsersGroups();
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsersGroups = async () => {
    const response = await axios.get('http://localhost:5000/api/usersgroup');
    setUsersGroupList(response.data);
  };

  const fetchUsers = async () => {
    const response = await axios.get('http://localhost:5000/api/user');
    setUserList(response.data);
  };

  const fetchGroups = async () => {
    const response = await axios.get('http://localhost:5000/api/group');
    setGroupList(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/usersgroup/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/usersgroup', formData);
    }
    fetchUsersGroups();
    setFormData({});
  };

  const handleEdit = (item) => {
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData(editData);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/usersgroup/${id}`);
    fetchUsersGroups();
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

  return (
    <div className={`flex justify-center items-center min-h-screen ${bgColor}`}>
      <div className={`shadow-lg rounded-lg p-6 w-full max-w-3xl ${cardBgColor}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold text-center ${textColor}`}>UsersGroup Management</h1>
          {/* <button 
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button> */}
        </div>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input 
            type="number"
            placeholder="id"
            value={formData.id || ''}
            onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })}
            className={`border p-3 rounded-md w-full focus:ring-2 outline-none ${inputClasses}`}
            hidden
          />
                
          <div className="w-full">
            <label className={`block text-sm font-medium mb-1 ${textColor}`}>User</label>
            <select
              value={formData.userId || ''}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className={`border p-3 rounded-md w-full focus:ring-2 outline-none ${inputClasses}`}
            >
              <option value="" disabled>Select User</option>
              {userList.map((item) => (
                <option key={item.mysqlId} value={item.mysqlId}>{item.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full">
            <label className={`block text-sm font-medium mb-1 ${textColor}`}>Group</label>
            <select
              value={formData.groupId || ''}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className={`border p-3 rounded-md w-full focus:ring-2 outline-none ${inputClasses}`}
            >
              <option value="" disabled>Select Group</option>
              {groupList.map((item) => (
                <option key={item.mysqlId} value={item.mysqlId}>{item.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>
        
        {/* Tabela e të dhënave */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md overflow-hidden">
            <thead>
              <tr className={`uppercase text-sm leading-normal ${tableHeaderColor}`}>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Group</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className={`text-sm font-light ${textColor}`}>
              {usersgroupList.length > 0 ? (
                usersgroupList.map((item) => (
                  <tr key={item.mysqlId || item.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${tableRowHover}`}>
                    <td className="py-3 px-6 text-left">{item.userId?.name || ''}</td>
                    <td className="py-3 px-6 text-left">{item.groupId?.name || ''}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">Nuk ka të dhëna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersGroup;