
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const Review = () => {
  const [formData, setFormData] = useState({});
  const [reviewList, setReviewList] = useState([]);
  
  useEffect(() => {
    fetchReviews();
    ;
  }, []);
  const fetchReviews = async () => {
    const response = await axios.get('http://localhost:5000/api/review');
    setReviewList(response.data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/review/${formData.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/review', formData);
    }
    fetchReviews();
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
    await axios.delete(`http://localhost:5000/api/review/${id}`);
    fetchReviews();
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Review Management</h1>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                
          <input 
            type="number"
            placeholder="id"
            value={formData.id || ''}
            onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="number"
            placeholder="rating"
            value={formData.rating || ''}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
      
          <input 
            type="text"
            placeholder="comment"
            value={formData.comment || ''}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
        
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox"
              checked={formData.verifiedPurchase || false}
              onChange={(e) => setFormData({ ...formData, verifiedPurchase: e.target.checked })}
              className="w-4 h-4"
            />
            <span>verifiedPurchase</span>
          </label>
          
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>
        {/* Tabela e të dhënave */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">id</th><th className="py-3 px-6 text-left">rating</th><th className="py-3 px-6 text-left">comment</th><th className="py-3 px-6 text-left">verifiedPurchase</th>
                <th className="py-3 px-6 text-center">Veprime</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {reviewList.length > 0 ? (
                reviewList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.id}</td><td className="py-3 px-6 text-left">{item.rating}</td><td className="py-3 px-6 text-left">{item.comment}</td><td className="py-3 px-6 text-left">{item.verifiedPurchase}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">Nuk ka të dhëna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Review;
