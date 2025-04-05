
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const Order = () => {
  const [formData, setFormData] = useState({});
  const [orderList, setOrderList] = useState([]);
  
  useEffect(() => {
    fetchOrders();
    ;
  }, []);
  const fetchOrders = async () => {
    const response = await axios.get('http://localhost:5000/api/order');
    setOrderList(response.data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/order/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/order', formData);
    }
    fetchOrders();
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
    await axios.delete(`http://localhost:5000/api/order/${id}`);
    fetchOrders();
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Order Management</h1>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                
          <input 
            type="text"
            placeholder="order_number"
            value={formData.order_number || ''}
            onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="text"
            placeholder="customer_name"
            value={formData.customer_name || ''}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="text"
            placeholder="training_title"
            value={formData.training_title || ''}
            onChange={(e) => setFormData({ ...formData, training_title: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="number"
            placeholder="quantity"
            value={formData.quantity || ''}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="number"
            placeholder="total_price"
            value={formData.total_price || ''}
            onChange={(e) => setFormData({ ...formData, total_price: Number(e.target.value) })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="text"
            placeholder="status"
            value={formData.status || ''}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />

          
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>
        {/* Tabela e të dhënave */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">order_number</th><th className="py-3 px-6 text-left">customer_name</th><th className="py-3 px-6 text-left">training_title</th><th className="py-3 px-6 text-left">quantity</th><th className="py-3 px-6 text-left">total_price</th><th className="py-3 px-6 text-left">status</th><th className="py-3 px-6 text-left">order_date</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {orderList.length > 0 ? (
                orderList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.order_number}</td><td className="py-3 px-6 text-left">{item.customer_name}</td><td className="py-3 px-6 text-left">{item.training_title}</td><td className="py-3 px-6 text-left">{item.quantity}</td><td className="py-3 px-6 text-left">{item.total_price}</td><td className="py-3 px-6 text-left">{item.status}</td><td className="py-3 px-6 text-left">{item.order_date}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-gray-500 py-4">Nuk ka të dhëna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Order;
