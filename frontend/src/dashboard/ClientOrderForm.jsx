import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ClientOrderForm = () => {
  const [clientData, setClientData] = useState({
    name: '',
    lastname: '',
    city: '',
    street: '',
    country: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false); 
  const { state } = useLocation();
  const { cart } = state || {};
  const navigate = useNavigate();
  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://countriesnow.space/api/v0.1/countries", {
          withCredentials: false 
        });
        if (response.data?.data) {
          setCountryList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Redirect if no cart items
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Please add items to your cart before proceeding to checkout.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/productspage")}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-lg font-medium text-lg transition-all duration-200"
          >
            Back to Shopping
          </motion.button>
        </div>
      </div>
    );
  }

  const calculateTotalPrice = (cartItems) => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setClientData(prev => ({ ...prev, country, city: '' })); // Reset city when country changes

    if (country === "Kosovo") {
      setCityList([
        "Prishtina", "Prizreni", "Peja", "Gjakova", "Ferizaj", "Gjilani", "Mitrovica",
        "Podujeva", "Vushtrria", "Suhareka", "Rahoveci", "Malisheva", "Drenasi", "Skenderaj",
        "Kamenica", "Istogu", "Deçani", "Dragashi", "Klinë", "Leposaviq", "Zubin Potok", "Zveçan",
        "Shtime", "Fushë Kosova", "Lipjan", "Obiliq", "Novobërda", "Junik", "Hani i Elezit",
        "Kaçaniku", "Mamushë", "Graçanica", "Ranillug", "Partesh", "Kllokot"
      ]);
    } else {
      const countryData = countryList.find(c => c.country === country);
      setCityList(countryData?.cities || []);
    }
  };

  const handleCityChange = (e) => {
    setClientData(prev => ({ ...prev, city: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!clientData.name || !clientData.lastname || !clientData.email || !clientData.phone || 
        !clientData.country || !clientData.city || !clientData.street) {
      alert('Please fill in all required fields.');
      return;
    }

    const totalPrice = calculateTotalPrice(cart);

    const transformedCart = cart.map(item => ({
      productId: item._id || item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData = {
      clientData,  
      orderDate: new Date().toISOString(),
      cart: transformedCart,  
      totalPrice,  
      status: 'pending'
    };

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/orders', orderData);
      const orderNumber = response.data.orderId || Math.floor(100000 + Math.random() * 900000);
      
      
      localStorage.removeItem("cart");
      
      
      navigate("/order-confirmation", {
        state: {
          orderNumber,
          clientData,
          cart,
          totalPrice
        }
      });

    } catch (error) {
      console.error("Order submission error:", error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-teal-500 py-6 px-8">
          <h2 className="text-3xl font-bold text-white text-center">Complete Your Order</h2>
        </div>

        <div className="p-8">
          {loading && (
            <div className="flex items-center justify-center mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-blue-600 font-medium">Processing your order...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={clientData.lastname}
                    onChange={(e) => setClientData({ ...clientData, lastname: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={clientData.phone}
                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={clientData.country}
                    onChange={handleCountryChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                    required
                  >
                    <option value="">Select country</option>
                    {countryList.map((c, i) => (
                      <option key={i} value={c.country}>{c.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={clientData.city}
                    onChange={handleCityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                    disabled={!clientData.country}
                    required
                  >
                    <option value="">Select city</option>
                    {cityList.map((city, i) => (
                      <option key={i} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={clientData.street}
                  onChange={(e) => setClientData({ ...clientData, street: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                  required
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between font-medium text-gray-800 mb-2">
                  <span>Total Items:</span>
                  <span>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-teal-600">
                  <span>Total Price:</span>
                  <span>${calculateTotalPrice(cart).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-lg font-medium text-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientOrderForm;