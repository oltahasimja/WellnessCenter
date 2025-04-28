import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";



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
  const [selectedCity, setSelectedCity] = useState("");

  if (!cart || cart.length === 0) {
    alert("No items in the cart. Please add items first.");
    return <div>No items in the cart.</div>;
  }

  const calculateTotalPrice = (cartItems) => {
    if (!Array.isArray(cartItems)) {
      return 0; 
    }
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  //handling city and country 
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


const handleCountryChange = (e) => {
  const country = e.target.value;
  setSelectedCountry(country);
  setClientData(prev => ({ ...prev, country })); 

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
      setCityList(countryData ? countryData.cities : []);
  }

  setSelectedCity(""); 
  setClientData(prev => ({ ...prev, city: "" }));
};

const handleCityChange = (e) => {
  setClientData({ ...clientData, city: e.target.value });
};

  // handling the order
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalPrice = calculateTotalPrice(cart);

    if (!cart || cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (!clientData.name || !clientData.lastname || !clientData.email || !clientData.phone) {
      alert('Please fill in all client details.');
      return;
    }

    const transformedCart = cart.map(item => ({
      productId: item._id || item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData = {
      mysqlId:"1",
      clientData,  
      orderDate: new Date(),
      cart: transformedCart,  
      totalPrice,  
    };

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/order', orderData); 
      alert('Your order has been placed successfully!');

      setClientData({
        name: '',
        lastname: '',
        city: '',
        street: '',
        country: '',
        email: '',
        phone: '',
      });

      localStorage.removeItem("cart");
      navigate("/productspage");

    } 
    //displaying errors
    catch (error) {
      alert('Something went wrong while placing the order. Please try again.');
      console.error("Error while placing the order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Client Information</h2>
      
      {loading && <p className="text-center text-blue-500 mt-4">Saving your order...</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Name"
            value={clientData.name}
            onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Lastname"
            value={clientData.lastname}
            onChange={(e) => setClientData({ ...clientData, lastname: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/*email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={clientData.email}
            onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
         {/*phone */}
        <div className="mb-6">
          <input
            type="tel"
            placeholder="Phone Number"
            value={clientData.phone}
            onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/*country */}
        <div className="mb-4">
        <select
        name="country"
        value={clientData.country}
        onChange={handleCountryChange}
       className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        >
        <option value="">Select a country</option>
        {countryList.map((country, index) => (
        <option key={index} value={country.country}>{country.country}</option>
        ))}
        </select>
        </div>
        {/*city */}
        <div className="mb-4">
        <select
        name="city"
        value={clientData.city}
        onChange={handleCityChange}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        disabled={!clientData.country}
        >
        <option value="">City</option>
        {cityList.map((city, index) => (
        <option key={index} value={city}>{city}</option>
        ))}
        </select>
        </div>
        {/*street */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Street"
            value={clientData.street}
            onChange={(e) => setClientData({ ...clientData, street: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Finish
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientOrderForm;
