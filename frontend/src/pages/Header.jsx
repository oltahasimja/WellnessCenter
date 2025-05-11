import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaShoppingCart, FaSignInAlt, FaSignOutAlt, FaComment } from 'react-icons/fa';
import axios from "axios";

const Header = ({ cart = [], showCart, setShowCart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Program', path: '/myprograms' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Shop', path: '/productspage' },
    { name: 'Training', path: '/trainingpage' },
  ];


  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (res.data.user) setUserData(res.data.user);
      } catch (err) {
        console.error("User fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const initials = userData
    ? `${userData.name?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`
    : '';

  const handleProfileClick = () => {
    if (userData) {
      navigate("/profile");
    } else {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate("/login");
    }
  };

  const handleChatClick = () => {
    if (userData) {
      navigate("/chat");
    } else {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      if (res.status === 200) {
        localStorage.removeItem('redirectAfterLogin');
        navigate('/login');
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  return (
<motion.header
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className={`fixed w-full z-50 px-8 transition-all duration-300 ${
    scrolled 
      ? 'bg-emerald-900 shadow-lg shadow-emerald-800/30 backdrop-blur-sm'
      : 'bg-gradient-to-b from-emerald-900 to-emerald-800'
  }`}
>
  <div className="flex items-center justify-between h-20 max-w-7xl mx-auto">
    {/* Left: Logo + Text */}
    <div className="flex items-center">
      <Link to="/" className="flex items-center group">
        <img 
          src="/images/logo.PNG"
          alt="WellnessCenter Logo"
          className="h-12 w-auto mr-3 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="text-3xl font-light text-emerald-100 tracking-tight font-serif">
        Wellness<span className="font-medium">Center</span>
        </span>
      </Link>
    </div>

    {/* Center: Navigation Items */}
    <div className="hidden md:flex space-x-10 absolute left-1/2 transform -translate-x-1/2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`text-lg font-normal transition-all duration-300 relative group font-sans ${
            location.pathname === item.path
              ? 'text-emerald-300'
              : 'text-emerald-100 hover:text-white'
          }`}
        >
          {item.name}
          <span className={`absolute -bottom-1 left-0 w-0 h-px bg-emerald-300 transition-all duration-500 group-hover:w-full ${
            location.pathname === item.path ? 'w-full' : ''
          }`}></span>
        </Link>
      ))}
    </div>

    {/* Right: Icons */}
    <div className="flex space-x-5 items-center">
      {/* Chat */}
      <button 
        onClick={handleChatClick} 
        className="relative p-2.5 rounded-full bg-emerald-700/40 hover:bg-emerald-600/50 transition-all duration-300 group
                   focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
      >
        <FaComment className="text-emerald-100 text-lg group-hover:text-white transition-colors" />
        <span className="absolute inset-0 rounded-full border border-emerald-300/30 opacity-0 group-hover:opacity-100 animate-ping duration-1000"></span>
      </button>

      {/* Cart */}
      <button
        onClick={() => setShowCart(!showCart)} 
        className="relative p-2.5 rounded-full bg-emerald-700/40 hover:bg-emerald-600/50 transition-all duration-300 group
                   focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
      >
        <FaShoppingCart className="text-emerald-100 text-lg group-hover:text-white transition-colors" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-emerald-800">
            {cart.length}
          </span>
        )}
      </button>

      {/* Profile */}
      <button
        onClick={handleProfileClick}
        className="relative w-10 h-10 bg-emerald-700/60 text-emerald-100 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 group
                   focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
      >
        {initials || <span className="text-lg">👤</span>}
      </button>

      {/* Login/Logout */}
      {userData ? (
        <button 
          onClick={handleLogout} 
          className="p-2.5 rounded-full bg-rose-800/40 hover:bg-rose-700/50 text-rose-100 hover:text-white transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-rose-300/50"
        >
          <FaSignOutAlt />
        </button>
      ) : (
        <Link 
          to="/login" 
          className="p-2.5 rounded-full bg-emerald-700/40 hover:bg-emerald-600/50 text-emerald-100 hover:text-white transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
        >
          <FaSignInAlt />
        </Link>
      )}
    </div>
  </div>
</motion.header>
  );
};

export default Header;