import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Product = () => {
  const [formData, setFormData] = useState({});
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/product');
      setProductList(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/category');
      setCategoryList(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
  
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
  
    try {
  
      const fetchResponse = await fetch('http://localhost:5001/api/product');
      const existingProducts = await fetchResponse.json();
  
    
      const duplicate = existingProducts.some(
        (product) => product.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
  
      if (duplicate) {
        alert('A product with this name already exists');
        return;
      }
  
      
      const dataToSubmit = {
        id: formData.id || undefined, 
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
      };
  
      
      if (formData.id) {
        await axios.put(`http://localhost:5001/api/product/${formData.id}`, dataToSubmit); 
      } else {
        await axios.post('http://localhost:5001/api/product', dataToSubmit); 
      }
  
      fetchProducts(); 
      setFormData({}); 
    } catch (error) {
      console.error('Error submitting product:', error.response?.data || error.message);
      alert('Failed to submit product');
    }
  };
  
  

  const handleEdit = (item) => {
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData(editData);
  };
  
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/api/product/${id}`);
    fetchProducts();
  };
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-700">
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-8xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Product Management</h1>
  
        {/* form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-gray-600 bg-gray-700 text-white p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
          />
  
          <input
            type="text"
            placeholder="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border border-gray-600 bg-gray-700 text-white p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
          />
          
          {/* price */}
          <input
            type="number"
            placeholder="price"
            value={formData.price || ''}
            onChange={(e) => {
              const numericValue = parseFloat(e.target.value);
              setFormData({ ...formData, price: isNaN(numericValue) ? '' : numericValue });
            }}
            className="border border-gray-600 bg-gray-700 text-white p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
          />
  
          <select
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="border border-gray-600 bg-gray-700 text-white p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="" className="bg-gray-700">Select Category</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id} className="bg-gray-700">
                {category.name}
              </option>
            ))}
          </select>
  
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border border-gray-600 bg-gray-700 text-white p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none file:bg-gray-600 file:text-white file:border-none file:rounded-md file:px-4 file:py-2 file:mr-4"
          />
  
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Update' : 'Add'}
          </button>
        </form>
  
        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-gray-800">
            <thead>
              <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">name</th>
                <th className="py-3 px-6 text-left">description</th>
                <th className="py-3 px-6 text-left">price</th>
                <th className="py-3 px-6 text-left">category</th>
                <th className="py-3 px-6 text-left">image</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 text-sm font-light">
              {productList.length > 0 ? (
                productList.map((item) => (
                  <tr key={`${item.id}-${item.name}`} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-6 text-left">{item.name}</td>
                    <td className="py-3 px-6 text-left">{item.description}</td>
                    <td className="py-3 px-6 text-left">{new Intl.NumberFormat('en-US').format(item.price)} €</td>
                    <td className="py-3 px-6 text-left">{item.category}</td>
                    <td className="py-3 px-6 text-left">
                      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                    </td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-400 py-4">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Product;
