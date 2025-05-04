import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Category = () => {
  const [formData, setFormData] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  
  useEffect(() => {
    fetchCategorys();
  }, []);

  const fetchCategorys = async () => {
    const response = await axios.get('http://localhost:5000/api/category');
    setCategoryList(response.data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/category/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/category', formData);
    }
    fetchCategorys();
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
    await axios.delete(`http://localhost:5000/api/category/${id}`);
    fetchCategorys();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-700">
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Category Management</h1>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input 
            type="text"
            placeholder="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-gray-600 bg-gray-700 text-white p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
          />
          
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-gray-800">
            <thead>
              <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">name</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 text-sm font-light">
              {categoryList.length > 0 ? (
                categoryList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-6 text-left">{item.name}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-gray-400 py-4">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Category;