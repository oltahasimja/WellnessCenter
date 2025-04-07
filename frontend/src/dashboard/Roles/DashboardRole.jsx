import React, { useState, useEffect } from 'react';
import { useTheme } from "../../components/ThemeContext";
import ThemeSwitcher from '../../components/ThemeSwitcher';
import axios from 'axios';

const DashboardRole = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({});
  const [roleList, setRoleList] = useState([]);
  
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const response = await axios.get('http://localhost:5000/api/dashboardrole');
    setRoleList(response.data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/dashboardrole/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/dashboardrole', formData);
    }
    fetchRoles();
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
    await axios.delete(`http://localhost:5000/api/dashboardrole/${id}`);
    fetchRoles();
  };

  return (
    <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className={`shadow-lg rounded-lg p-6 w-full max-w-7xl ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">DashboardRole Management</h1>
          {/* <ThemeSwitcher /> */}
        </div>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input 
            type="text"
            placeholder="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
          />
          
          <button 
            type="submit" 
            className={`w-full ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 rounded-md font-semibold text-lg`}
          >
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>

        {/* Tabela e të dhënave */}
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse shadow-md rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <thead>
              <tr className={`${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'} uppercase text-sm leading-normal`}>
                <th className="py-3 px-6 text-left">name</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className={`text-sm font-light ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {roleList.length > 0 ? (
                roleList.map((item) => (
                  <tr 
                    key={item.mysqlId || item.id} 
                    className={`border-b ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-100'}`}
                  >
                    <td className="py-3 px-6 text-left">{item.name}</td>
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
                  <td colSpan="2" className="text-center py-4">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Nuk ka të dhëna
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardRole;