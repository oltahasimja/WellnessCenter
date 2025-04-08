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
    const response = await axios.get('http://localhost:5000/api/product');
    setProductList(response.data);
  };

  const fetchCategories = async () => {
    const response = await axios.get('http://localhost:5000/api/category');
    setCategoryList(response.data);
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!formData.category) {
        alert('Please select a category');
        return;
    }

    const dataToSubmit = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: formData.image,
    };


    if (formData.id) {
        await axios.put(`http://localhost:5000/api/product/${formData.id}`, dataToSubmit);
    } else {
        await axios.post('http://localhost:5000/api/product', dataToSubmit);
    }

    fetchProducts();
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
    await axios.delete(`http://localhost:5000/api/product/${id}`);
    fetchProducts();
  };

  // base64 image upload
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

  const handlePriceChange = (e) => {
    let value = e.target.value;

    value = value.replace('€', '').trim();  

    
    if (value === '' || !isNaN(value)) {
      setFormData({ ...formData, price: value });
    }
  };

  const handleAddToCart = async (product) => {
    const cartId = "someCartId"; // Get the correct cartId based on your app's logic (e.g., from context or global state)
    try {
      // Call the backend API to add the product to the cart
      await axios.post('http://localhost:5000/api/cart', { productId: product.id, quantity: 1, cartId });
  
      // Handle success (e.g., show a success message or update cart count)
      alert('Product added to cart!');
    } catch (err) {
      // Handle error if needed
      alert('Failed to add product to cart. Please try again.');
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Product Management</h1>

        {/* form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            placeholder="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
        {/* price & currency */}
          <input
            type="text"
            placeholder="price"
            value={formData.price !== undefined && formData.price !== '' ? `${new Intl.NumberFormat('en-US').format(formData.price)}€` : ''}
            onChange={handlePriceChange} 
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* categories */}
      <select
        value={formData.category || ''}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Select Category</option>
        {/* rendering dinamically */}
        {categoryList.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

          {/* image */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Update' : 'Add'}
          </button>
        </form>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">name</th>
                <th className="py-3 px-6 text-left">description</th>
                <th className="py-3 px-6 text-left">price</th>
                <th className="py-3 px-6 text-left">category</th>
                <th className="py-3 px-6 text-left">image</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {productList.length > 0 ? (
                productList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.name}</td>
                    <td className="py-3 px-6 text-left">{item.description}</td>
                    <td className="py-3 px-6 text-left">{new Intl.NumberFormat('en-US').format(item.price)}&nbsp;€</td>
                    <td className="py-3 px-6 text-left">{item.category}</td>
                    <td className="py-3 px-6 text-left">{item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                      <button onClick={handleAddToCart} className="bg-green-500 hover:bg-green-300 text-white py-1 px-3 rounded-md text-sm">Add To Cart</button>
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

export default Product;
