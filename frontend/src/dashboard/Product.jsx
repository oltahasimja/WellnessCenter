import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Product = () => {
  const [formData, setFormData] = useState({});
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/product');
      setProductList(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/category');
      setCategoryList(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents form from refreshing the page.
  
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
  
    try {
      // Fetch existing products to check for duplicates
      const fetchResponse = await fetch('http://localhost:5000/api/product');
      const existingProducts = await fetchResponse.json();
  
      // Check if the product already exists based on name
      const duplicate = existingProducts.some(
        (product) => product.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
  
      if (duplicate) {
        alert('A product with this name already exists');
        return;
      }
  
      // Prepare data to submit
      const dataToSubmit = {
        id: formData.id || undefined,  // If there's no id, set it to undefined for new product
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
      };
  
      // If formData has an id, update the product; else, create a new one
      if (formData.id) {
        await axios.put(`http://localhost:5000/api/product/${formData.id}`, dataToSubmit); // Update
      } else {
        await axios.post('http://localhost:5000/api/product', dataToSubmit); // Create
      }
  
      fetchProducts(); // Refresh the product list after adding or updating
      setFormData({}); // Clear form
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
    await axios.delete(`http://localhost:5000/api/product/${id}`);
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

  const addToCart = (product) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }
    

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert("Product added to cart!");
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
          
          {/* price */}
          <input
            type="number"
            placeholder="price"
            value={formData.price || ''}
            onChange={(e) => {
              const numericValue = parseFloat(e.target.value);
              setFormData({ ...formData, price: isNaN(numericValue) ? '' : numericValue });
            }}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Category</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

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
                  <tr key={`${item.id}-${item.name}`} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.name}</td>
                    <td className="py-3 px-6 text-left">{item.description}</td>
                    <td className="py-3 px-6 text-left">{new Intl.NumberFormat('en-US').format(item.price)} €</td>
                    <td className="py-3 px-6 text-left">{item.category}</td>
                    <td className="py-3 px-6 text-left">
                      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                    </td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm">Edit</button>
                      <button onClick={() => handleDelete(item.mysqlId || item.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">Delete</button>
                      <button onClick={() => addToCart(item)} className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm">Add to Cart</button>
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
