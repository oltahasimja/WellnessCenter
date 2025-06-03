import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaShoppingCart, FaSignInAlt, FaSignOutAlt, FaComment, FaUser, FaBars, FaTimes, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import axios from "axios";
import CartContext from "../context/CartContext";
import io from 'socket.io-client';
import { useNotificationSound } from "../context/NotificationSoundContext";

const Header = () => {
  const { cart, showCart, setShowCart } = useContext(CartContext);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [socket, setSocket] = useState(null);

const { soundEnabled, toggleSound, audioInitialized, playNotificationSound } = useNotificationSound();


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

  useEffect(() => {
    if (userData) {
      const socketConnection = io('http://localhost:5000', {
        auth: {
          userId: userData.id
        }
      });

      setSocket(socketConnection);
      socketConnection.emit('userConnected', { userId: userData.id });
      socketConnection.emit('getTotalUnreadCount', { userId: userData.id });

      socketConnection.on('totalUnreadCount', (data) => {
        const previousCount = unreadMessagesCount;
        setUnreadMessagesCount(data.totalUnreadCount);

        if (data.totalUnreadCount > previousCount && location.pathname !== '/chat') {
          console.log("Rritje e unreadMessages: duke luajtur tingullin...");
          playNotificationSound();
        }
      });

      socketConnection.on('unreadMessagesUpdate', () => {
        socketConnection.emit('getTotalUnreadCount', { userId: userData.id });
      });

      socketConnection.on('newMessage', (message) => {
        if (message.userId.mysqlId !== userData.id && location.pathname !== '/chat' && audioInitialized) {
          playNotificationSound();

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Mesazh i ri', {
              body: `${message.userId.name}: ${message.text.substring(0, 50)}...`,
              icon: '/images/logo.PNG'
            });
          }
        }

        if (message.userId.mysqlId !== userData.id) {
          socketConnection.emit('getTotalUnreadCount', { userId: userData.id });
        }
      });

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [userData, location.pathname, unreadMessagesCount, audioInitialized]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/chat' && socket && userData) {
      const timer = setTimeout(() => {
        socket.emit('getTotalUnreadCount', { userId: userData.id });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, socket, userData]);

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
        localStorage.removeItem('currentUser');

        if (socket) {
          socket.disconnect();
        }

        window.location.reload();
        navigate('/login');
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed w-full z-50 px-4 md:px-8 transition-all duration-300 ${
        scrolled 
          ? 'bg-teal-600 shadow-lg shadow-emerald-800/30 backdrop-blur-sm'
          : 'bg-gradient-to-br from-teal-700 to-teal-500'
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

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center bg-teal-600">
          <button 
            onClick={toggleMobileMenu}
            className="p-2 text-emerald-100 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Center: Navigation Items (Desktop) */}
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
        <div className="hidden md:flex space-x-5 items-center">
          {/* Sound Toggle Button */}
          {userData && (
            <button 
              onClick={toggleSound}
              className={`p-2.5 rounded-full transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-emerald-300/50 ${
                soundEnabled 
                  ? 'bg-emerald-700/40 hover:bg-emerald-600/50 text-emerald-100 hover:text-white' 
                  : 'bg-gray-700/40 hover:bg-gray-600/50 text-gray-300 hover:text-white'
              }`}
              title={soundEnabled ? 'Çaktivizo zërat' : 'Aktivizo zërat'}
            >
              {soundEnabled ? (
                <FaVolumeUp className="text-lg transition-colors" />
              ) : (
                <FaVolumeMute className="text-lg transition-colors" />
              )}
              {/* Indicator për audio initialization */}
              {!audioInitialized && soundEnabled && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              )}
            </button>
          )}

          {/* Chat with unread count */}
          <button 
            onClick={handleChatClick} 
            className="relative p-2.5 rounded-full bg-emerald-700/40 hover:bg-emerald-600/50 transition-all duration-300 group
                       focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
          >
            <FaComment className="text-emerald-100 text-lg group-hover:text-white transition-colors" />
            {/* Badge për mesazhet e palexuara */}
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center border-2 border-emerald-800 animate-pulse">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
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
               
              </motion.div>
            )}

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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-teal-600 shadow-lg"
        >
          <div className="px-4 py-2 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-lg font-medium ${
                  location.pathname === item.path
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-emerald-700 flex flex-col space-y-4">
              {/* Sound toggle në mobile menu */}
              {userData && (
                <button 
                  onClick={toggleSound}
                  className={`flex items-center px-3 py-2 rounded-md text-lg font-medium transition-colors ${
                    soundEnabled 
                      ? 'text-emerald-100 hover:bg-emerald-700 hover:text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {soundEnabled ? (
                    <FaVolumeUp className="mr-3" />
                  ) : (
                    <FaVolumeMute className="mr-3" />
                  )}
                  {soundEnabled ? 'Çaktivizo zërat' : 'Aktivizo zërat'}
                  {!audioInitialized && soundEnabled && (
                    <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full"></span>
                  )}
                </button>
              )}

              <button 
                onClick={() => {
                  handleChatClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 rounded-md text-lg font-medium text-emerald-100 hover:bg-emerald-700 hover:text-white relative"
              >
                <FaComment className="mr-3" />
                Chat
                {/* Badge për mobile menu */}
                {unreadMessagesCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowCart(!showCart);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 rounded-md text-lg font-medium text-emerald-100 hover:bg-emerald-700 hover:text-white relative"
              >
                <FaShoppingCart className="mr-3" />
                Cart
                {cart.length > 0 && (
                  <span className="ml-auto bg-amber-400 text-emerald-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  handleProfileClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 rounded-md text-lg font-medium text-emerald-100 hover:bg-emerald-700 hover:text-white"
              >
                <FaUser className="mr-3" />
                Profile
              </button>

              {userData && (["Owner", "Fizioterapeut", "Nutricionist", "Trajner", "Psikolog"].includes(userData.role) || 
                (userData.role === "Client" && ["Owner", "Admin", "Manager"].includes(userData.dashboardRole))) && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-lg font-medium text-emerald-100 hover:bg-emerald-700 hover:text-white"
                >
                  <FaUser className="mr-3" />
                  Dashboard
                </Link>
              )}

              {userData ? (
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center px-3 py-2 rounded-md text-lg font-medium text-rose-100 hover:bg-rose-700 hover:text-white"
                >
                  <FaSignOutAlt className="mr-3" />
                  Logout
                </button>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-lg font-medium text-emerald-100 hover:bg-emerald-700 hover:text-white"
                >
                  <FaSignInAlt className="mr-3" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;