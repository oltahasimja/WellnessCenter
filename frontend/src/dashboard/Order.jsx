import React, { useState, useEffect } from 'react';
import axios from 'axios';


const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/order'); 
      console.log('Fetched orders:', response.data); 
      setOrders(response.data); 
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again later.'); 
    } finally {
      setLoading(false); 
    }
  };

  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Order Dashboard</h1>


        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Order No:</th>
                <th className="py-3 px-6 text-left">Client Name</th>
                <th className="py-3 px-6 text-left">Lastame</th>
                <th className="py-3 px-6 text-left">Total Price</th>
                <th className="py-3 px-6 text-left">Cart Details</th>
                <th className="py-3 px-6 text-left">Client Info</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order.id || order.mysqlId} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{index+1}</td>
                    <td className="py-3 px-6">{order.clientData.name || 'Unknown'}</td>
                    <td className="py-3 px-6">{order.clientData.lastname || 'Unknown'}</td>
                    <td className="py-3 px-6">${order.totalPrice || 0}</td>
                    <td className="py-3 px-6">
                      <ul>
                        {order.cart?.map((item, index) => (
                          <li key={index}>
                            {item.productId}  {item.quantity} x ${item.price}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-6">
                      <p>Email: {order.clientData.email || 'N/A'}</p>
                      <p>Phone: {order.clientData.phone || 'N/A'}</p>
                      <p>Address: {order.clientData.country && order.clientData.city && order.clientData.street ? `${order.clientData.country}, ${order.clientData.city}, ${order.clientData.street}` : 'N/A'}</p>
                    </td>
                    <td className="py-3 px-6 text-center flex justify-center space-x-2">
                     
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Order;