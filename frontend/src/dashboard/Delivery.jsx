
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
    try {
      const payload = {
        deliveryAddress: formData.deliveryAddress,
        emailSent: formData.emailSent || false,
        orderId: formData.orderId // This should be the MySQL order ID
      };
      
      if (formData.id) {
        await axios.put(`http://localhost:5000/api/delivery/${formData.id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/delivery', payload);
      }
      fetchDeliverys();
      setFormData({});
    } catch (error) {
      console.error("Error saving delivery:", error);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
            <option key={item.mysqlId} value={item.mysqlId}>{item.clientData.name}</option>
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
    <th className="py-3 px-6 text-left">Client</th>
    <th className="py-3 px-6 text-left">Status</th>
    <th className="py-3 px-6 text-left">Address</th>
    <th className="py-3 px-6 text-left">Delivery Date</th>
    <th className="py-3 px-6 text-left">Email Status</th>
    <th className="py-3 px-6 text-center">Actions</th>
  </tr>
</thead>
            <tbody className="text-gray-700 text-sm font-light">
            {deliveryList.length > 0 ? (
  deliveryList.map((item) => (
    <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
      <td className="py-3 px-6 text-left">
        {item.orderMongoId?.clientData?.name || 'N/A'}
      </td>
      <td className="py-3 px-6 text-left">
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          item.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
          item.status === 'delivered' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      </td>
      <td className="py-3 px-6 text-left">{item.deliveryAddress}</td>
      <td className="py-3 px-6 text-left">
        {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="py-3 px-6 text-left">
        {item.emailSent ? (
          <span className="text-green-500">✓ Sent</span>
        ) : (
          <span className="text-red-500">✗ Not Sent</span>
        )}
      </td>
      <td className="py-3 px-6 flex justify-center space-x-2">
        <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
        <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="6" className="text-center text-gray-500 py-4">No data available</td>
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
