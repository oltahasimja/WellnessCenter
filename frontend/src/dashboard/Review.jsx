import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Review = () => {
  const [formData, setFormData] = useState({});
  const [reviewList, setReviewList] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const response = await axios.get('http://localhost:5000/api/review');
    setReviewList(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`http://localhost:5000/api/review/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/review', formData);
      }
      
      fetchReviews();
      setFormData({});
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting the review.');
    }
  
  
    fetchReviews();
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/review/${id}`);
    fetchReviews();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Review Management</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">

          <input 
            type="text"
            placeholder="Product Name"
            value={formData.productName || ''}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className="border p-3 rounded-md w-full"
            required
          />

          <input 
            type="number"
            placeholder="Rating (1-5)"
            min="1"
            max="5"
            value={formData.rating || ''}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            className="border p-3 rounded-md w-full"
            required
          />

          <textarea 
            placeholder="Comment about the product"
            value={formData.comment || ''}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="border p-3 rounded-md w-full"
            required
          />

          <label className="flex items-center space-x-2">
            <input 
              type="checkbox"
              checked={formData.verifiedPurchase || false}
              onChange={(e) => setFormData({ ...formData, verifiedPurchase: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Verified Purchase</span>
          </label>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold">
            {formData.id ? 'Update' : 'Add Review'}
          </button>
        </form>

        {/* Review Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                <th className="py-3 px-6 text-left">Product</th>
                <th className="py-3 px-6 text-left">Rating</th>
                <th className="py-3 px-6 text-left">Comment</th>
                <th className="py-3 px-6 text-left">Verified</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {reviewList.length > 0 ? (
                reviewList.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{item.productName}</td>
                    <td className="py-3 px-6">{item.rating}</td>
                    <td className="py-3 px-6">{item.comment}</td>
                    <td className="py-3 px-6">{item.verifiedPurchase ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">No reviews yet</td>
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
