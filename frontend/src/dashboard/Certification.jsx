
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const Certification = () => {
  const [formData, setFormData] = useState({});
  const [certificationList, setCertificationList] = useState([]);
  const [userList, setUserList] = useState([]);
const [trainingList, setTrainingList] = useState([]);
axios.defaults.withCredentials = true;
  useEffect(() => {
    fetchCertifications();
    fetchUsers();
fetchTrainings();;
  }, []);
  const fetchCertifications = async () => {
    const response = await axios.get('http://localhost:5000/api/certification');
    setCertificationList(response.data);
  };
  const fetchUsers = async () => {
    const response = await axios.get('http://localhost:5000/api/user');
    setUserList(response.data);
  };
const fetchTrainings = async () => {
    const response = await axios.get('http://localhost:5000/api/training');
    setTrainingList(response.data);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/certification/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/certification', formData);
    }
    fetchCertifications();
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
    await axios.delete(`http://localhost:5000/api/certification/${id}`);
    fetchCertifications();
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Certification Management</h1>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                
          <input 
            type="text"
            placeholder="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="text"
            placeholder="issuingOrganization"
            value={formData.issuingOrganization || ''}
            onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="text"
            placeholder="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />


      
          <input 
            type="text"
            placeholder="credentialId"
            value={formData.credentialId || ''}
            onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="text"
            placeholder="credentialUrl"
            value={formData.credentialUrl || ''}
            onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
                
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
        <select
          value={formData.userId || ''}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="" disabled>Select User</option>
          {userList.map((item) => (
            <option key={item.mysqlId} value={item.mysqlId}>{item.name}</option>
          ))}
        </select>
      </div>
      
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">Training</label>
        <select
          value={formData.trainingId || ''}
          onChange={(e) => setFormData({ ...formData, trainingId: e.target.value })}
          className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="" disabled>Select Training</option>
          {trainingList.map((item) => (
            <option key={item.mysqlId} value={item.mysqlId}>{item.title}</option>
          ))}
        </select>
      </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>
        {/* Tabela e të dhënave */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">title</th><th className="py-3 px-6 text-left">issuingOrganization</th><th className="py-3 px-6 text-left">description</th><th className="py-3 px-6 text-left">issueDate</th><th className="py-3 px-6 text-left">expiryDate</th><th className="py-3 px-6 text-left">credentialId</th><th className="py-3 px-6 text-left">credentialUrl</th><th className="py-3 px-6 text-left">User</th><th className="py-3 px-6 text-left">Training</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {certificationList.length > 0 ? (
                certificationList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.title}</td><td className="py-3 px-6 text-left">{item.issuingOrganization}</td><td className="py-3 px-6 text-left">{item.description}</td><td className="py-3 px-6 text-left">{item.issueDate}</td><td className="py-3 px-6 text-left">{item.expiryDate}</td><td className="py-3 px-6 text-left">{item.credentialId}</td><td className="py-3 px-6 text-left">{item.credentialUrl}</td><td className="py-3 px-6 text-left">{item.userId?.name || ''}</td><td className="py-3 px-6 text-left">{item.trainingId?.name || ''}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-gray-500 py-4">Nuk ka të dhëna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Certification;
