
import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiUser, FiStar, FiHeart, FiShare2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';

const TrainingPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [trainings, setTrainings] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user", { withCredentials: true });
        if (!response.data.user) {
          navigate("/login");
        } else {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    
    checkLoginStatus();
  }, [navigate]);
  
  // Separate useEffect to fetch data after user is loaded
  useEffect(() => {
    if (currentUser) {
      fetchTrainings();
      fetchUserApplications();
    }
  }, [currentUser]);
  
  const fetchTrainings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/training", { withCredentials: true });
      setTrainings(response.data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
    }
  };
  
  const fetchUserApplications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/trainingapplication", { withCredentials: true });
      console.log("All applications:", response.data);
      console.log("Current user:", currentUser);
      
      // Filter applications to only include those belonging to the current user
      if (currentUser) {
        const userApps = response.data.filter(app => 
          isSameUser(app.userId, currentUser) || 
          (currentUser.username === "bani" && app.userId.username === "bani")
        );
        console.log("Filtered applications for user:", userApps);
        setUserApplications(userApps);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      setLoading(false);
    }
  };
  
  const toggleFavorite = (trainingId) => {
    if (favorites.includes(trainingId)) {
      setFavorites(favorites.filter(id => id !== trainingId));
    } else {
      setFavorites([...favorites, trainingId]);
    }
  };
  
  // Direct comparison function that handles different user ID formats
  const isSameUser = (user1, user2) => {
    if (!user1 || !user2) return false;
    
    // Try to match by ID
    if (user1._id && user2._id && user1._id === user2._id) return true;
    
    // Try to match by username if IDs don't match
    if (user1.username && user2.username && user1.username === user2.username) return true;
    
    // Try to match by email
    if (user1.email && user2.email && user1.email === user2.email) return true;
    
    return false;
  };
  
  // Get user's trainings (those they've applied to)
  const getUserTrainings = () => {
    if (!userApplications.length) return [];
    
    console.log("Building user trainings from applications:", userApplications);
    
    return userApplications.map(app => {
      // Find the full training details
      const trainingDetails = trainings.find(t => t._id === app.trainingId._id) || app.trainingId;
      console.log("Training details for application:", trainingDetails);
      return {
        ...trainingDetails,
        applicationStatus: app.status
      };
    });
  };
  
  const userTrainings = getUserTrainings();
  
  // Filter trainings based on selected category
  const filteredTrainings = selectedCategory === 'all' 
    ? userTrainings 
    : userTrainings.filter(training => training.category === selectedCategory);
  
  // Get unique categories from user's trainings
  const categories = ['all', ...new Set(userTrainings.map(training => training.category))];
  



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-teal-400 py-20">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Training Programs</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">
            View your enrolled training programs and track your progress.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-gray-200 mb-8">
          <button
            className={`mr-8 py-4 text-lg font-medium ${
              activeTab === 'classes' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('classes')}
          >
            My Classes
          </button>
          <button
            className={`mr-8 py-4 text-lg font-medium ${
              activeTab === 'favorites' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </div>
        
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-teal-400 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your trainings...</p>
          </div>
        ) : (
          <>
            {activeTab === 'classes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrainings.length > 0 ? (
                  filteredTrainings.map((training) => (
                    <div key={training._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <Link 
                              to={`/training/${training.mysqlId || training.id}`} >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">

                         
                      
                        {training.title}

                          </h3>
                          <button
                            onClick={() => toggleFavorite(training._id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <FiHeart
                              className={favorites.includes(training._id) ? "text-red-500 fill-current" : ""}
                              size={20}
                            />
                          </button>
                        </div>
                        {/* <p className="text-sm text-gray-500 mb-4">{training.category}</p> */}
                        
                        <div className="mb-4">
                          <p className={`text-gray-700 ${!expandedDescription ? "line-clamp-3" : ""}`}>
                            {training.description}
                          </p>
                          <button
                            onClick={() => setExpandedDescription(!expandedDescription)}
                            className="text-teal-600 text-sm font-medium flex items-center mt-2"
                          >
                            {expandedDescription ? (
                              <>Read less <FiChevronUp className="ml-1" /></>
                            ) : (
                              <>Read more <FiChevronDown className="ml-1" /></>
                            )}
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <FiClock className="mr-2" />
                            <span>{training.duration}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <FiUser className="mr-2" />
                            <span>Max participants: {training.max_participants}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiCalendar className="mr-2" />
                            <span>Created: {new Date(training.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            training.applicationStatus === 'miratuar' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Status: {training.applicationStatus.charAt(0).toUpperCase() + training.applicationStatus.slice(1)}
                          </div>
                        </div>
                      </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">You are not enrolled in any training programs yet.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrainings.filter(training => favorites.includes(training._id)).length > 0 ? (
                  filteredTrainings
                    .filter(training => favorites.includes(training._id))
                    .map((training) => (
                      <div key={training._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Same card structure as above */}
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{training.title}</h3>
                            <button
                              onClick={() => toggleFavorite(training._id)}
                              className="text-red-500"
                            >
                              <FiHeart className="fill-current" size={20} />
                            </button>
                          </div>
                          {/* Rest of the card content */}
                          <p className="text-sm text-gray-500 mb-4">{training.category}</p>
                          <div className="mb-4">
                            <p className="text-gray-700">{training.description}</p>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <FiClock className="mr-2" />
                              <span>{training.duration}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <FiUser className="mr-2" />
                              <span>Max participants: {training.max_participants}</span>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              training.applicationStatus === 'miratuar' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              Status: {training.applicationStatus.charAt(0).toUpperCase() + training.applicationStatus.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">You haven't added any training programs to your favorites yet.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default TrainingPage;