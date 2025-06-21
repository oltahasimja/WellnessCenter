
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const MessageMongo = () => {
  const [formData, setFormData] = useState({});
  const [messagemongoList, setMessageMongoList] = useState([]);
  
  useEffect(() => {
    fetchMessageMongos();
    ;
  }, []);
  const fetchMessageMongos = async () => {
    const response = await axios.get('http://localhost:5001/api/messagemongo');
    setMessageMongoList(response.data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5001/api/messagemongo/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5001/api/messagemongo', formData);
    }
    fetchMessageMongos();
    setFormData({});
  };
  const handleEdit = (item) => {
    // Create a copy of the item to avoid direct modification
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData(editData);
  };
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/api/messagemongo/${id}`);
    fetchMessageMongos();
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">MessageMongo Management</h1>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          
          
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>
        {/* Tabela e të dhënave */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {messagemongoList.length > 0 ? (
                messagemongoList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="1" className="text-center text-gray-500 py-4">Nuk ka të dhëna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default MessageMongo;
