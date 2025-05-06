import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaShoppingCart, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import axios from "axios";

const Header = ({ cart = [], showCart, setShowCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Program', path: '/myprograms' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Shop', path: '/productspage' },
    { name: 'Training', path: '/trainingpage' },
    // { name: 'MyAppointment', path: '/myappointments' },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user', {
          withCredentials: true
        });
        
        if (response.data.user) {
          setUserData(response.data.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
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
      navigate("/dashboard/profile");
    } else {
      // Ruaj rrugën aktuale para se të ridrejtohet në login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      if (response.status === 200) {
        localStorage.removeItem('redirectAfterLogin');
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="flex items-center">
              <span className={`text-2xl font-bold ${scrolled ? 'text-teal-600' : 'text-white'}`}>
                WellnessCenter
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 mr-[5rem] items-center">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  onClick={() => {
                    if (!userData) {
                      localStorage.setItem('redirectAfterLogin', item.path);
                    }
                  }}
                  className={`px-3 py-2 text-lg font-medium transition-colors duration-300 ${
                    location.pathname === item.path
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : scrolled
                      ? 'text-gray-700 hover:text-teal-600'
                      : 'text-teal-600 hover:text-teal-300'
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}

            {/* Dashboard/Login Button */}
            {userData ? (
              (["Owner", "Fizioterapeut", "Nutricionist", "Trajner", "Psikolog"].includes(userData.role) || 
              (userData.role === "Client" && ["Owner", "Admin", "Manager"].includes(userData.dashboardRole))) ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-4"
                >
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-4 py-2 rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-300 ${
                      scrolled ? '' : 'shadow-lg'
                    }`}
                  >
                    <FaUser className="mr-2" />
                    Dashboard
                  </Link>
                </motion.div>
              ) : null
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4"
              >
                <Link
                  to="/login"
                  onClick={() => localStorage.setItem('redirectAfterLogin', window.location.pathname)}
                  className={`flex items-center px-4 py-2 rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-300 ${
                    scrolled ? '' : 'shadow-lg'
                  }`}
                >
                  <FaSignInAlt className="mr-2" />
                  Log in
                </Link>
              </motion.div>
            )}

            {/* Cart */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(!showCart)}
              className="relative ml-4 cursor-pointer"
            >
              <FaShoppingCart 
                className="text-xl text-teal-600 hover:text-teal-700"
              />
              {cart.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {cart.length}
                </motion.span>
              )}
            </motion.div>

            {/* Profile Icon */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProfileClick}
              className="cursor-pointer ml-4"
            >
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              ) : userData ? (
                userData.profileImage ? (
                  <img
                    src={`data:image/jpeg;base64,${userData.profileImage}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 hover:border-blue-600 transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 font-bold">
                      {initials}
                    </span>
                  </div>
                )
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <FaUser className="text-gray-600" />
                </div>
              )}
            </motion.div>

            {userData && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4"
              >
                <button
                  onClick={handleLogout}
                  className={`flex items-center px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-300 ${
                    scrolled ? '' : 'shadow-lg'
                  }`}
                >
                  <FaSignOutAlt className="" />
                </button>
              </motion.div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
              aria-label="Main menu"
            >
              {isOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="pt-2"
          >
            {userData ? (
              (["Owner", "Fizioterapeut", "Nutricionist", "Trajner", "Psikolog"].includes(userData.role) || 
              (userData.role === "Client" && ["Owner", "Admin", "Manager"].includes(userData.dashboardRole))) ? (
                <Link
                  to="/dashboard"
                  onClick={toggleMenu}
                  className="block w-full px-4 py-2 text-center rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700"
                >
                  Dashboard
                </Link>
              ) : null
            ) : (
              <Link
                to="/login"
                onClick={() => {
                  localStorage.setItem('redirectAfterLogin', window.location.pathname);
                  toggleMenu();
                }}
                className="block w-full px-4 py-2 text-center rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700"
              >
                Log in
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;