
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const Delivery = () => {
  const [formData, setFormData] = useState({});
  const [deliveryList, setDeliveryList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  useEffect(() => {
    fetchDeliverys();
    fetchOrders();;
  }, []);
  const fetchDeliverys = async () => {
    const response = await axios.get('http://localhost:5000/api/delivery');
    setDeliveryList(response.data);
  };
  const fetchOrders = async () => {
    const response = await axios.get('http://localhost:5000/api/order');
    setOrderList(response.data);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/delivery/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/delivery', formData);
    }
    fetchDeliverys();
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
    await axios.delete(`http://localhost:5000/api/delivery/${id}`);
    fetchDeliverys();
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Delivery Management</h1>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          

      
          <input 
            type="text"
            placeholder="deliveryAddress"
            value={formData.deliveryAddress || ''}
            onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />

        
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox"
              checked={formData.emailSent || false}
              onChange={(e) => setFormData({ ...formData, emailSent: e.target.checked })}
              className="w-4 h-4"
            />
            <span>emailSent</span>
          </label>
                
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
        <select
          value={formData.orderId || ''}
          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
          className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="" disabled>Select Order</option>
          {orderList.map((item) => (
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
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">id</th><th className="py-3 px-6 text-left">Order</th><th className="py-3 px-6 text-left">status</th><th className="py-3 px-6 text-left">deliveryAddress</th><th className="py-3 px-6 text-left">deliveryDate</th><th className="py-3 px-6 text-left">emailSent</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {deliveryList.length > 0 ? (
                deliveryList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.id}</td><td className="py-3 px-6 text-left">{item.orderId?.name || ''}</td><td className="py-3 px-6 text-left">{item.status}</td><td className="py-3 px-6 text-left">{item.deliveryAddress}</td><td className="py-3 px-6 text-left">{item.deliveryDate}</td><td className="py-3 px-6 text-left">{item.emailSent}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-4">Nuk ka të dhëna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Delivery;
