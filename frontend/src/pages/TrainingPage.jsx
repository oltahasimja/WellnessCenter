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
        {/* New Button Added Here */}
        <div className="mb-8 flex justify-end">
          <Link 
            to="/trainingapplicationn" // Replace this with your desired path
            className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Shiko dhe Apliko për Trajnimet që Ne Ofrojmë 
          </Link>
        </div>
        
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
      
      {/* Wellness Center Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Wellness Center
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Discover holistic approaches to health and wellbeing
            </p>
          </div>

          {/* Wellness Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            {/* Service 1 */}
            <div className="bg-teal-50 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-teal-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Energy Healing</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Rebalance your body's energy systems with our certified practitioners using Reiki, Qi Gong, and other energy healing modalities.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-teal-600 font-medium">60-90 min sessions</span>
                  <button className="text-teal-600 hover:text-teal-800 font-medium">
                    Learn more →
                  </button>
                </div>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-amber-50 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Meditation Programs</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Guided meditation sessions tailored to reduce stress, improve focus, and promote emotional wellbeing. Suitable for all experience levels.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600 font-medium">Daily sessions</span>
                  <button className="text-amber-600 hover:text-amber-800 font-medium">
                    Learn more →
                  </button>
                </div>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-rose-50 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-rose-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Holistic Nutrition</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Personalized nutrition plans combining modern science with traditional wisdom to optimize your health and vitality.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-rose-600 font-medium">Custom plans</span>
                  <button className="text-rose-600 hover:text-rose-800 font-medium">
                    Learn more →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Features */}
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our Wellness Center?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <div className="bg-teal-100 p-4 rounded-full mb-4">
                    <FiUser className="text-teal-600 text-xl" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Certified Practitioners</h4>
                  <p className="text-gray-600 text-sm">All our staff are highly trained and certified in their specialties.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-100 p-4 rounded-full mb-4">
                    <FiStar className="text-amber-600 text-xl" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Personalized Approach</h4>
                  <p className="text-gray-600 text-sm">Tailored programs designed for your unique needs and goals.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-rose-100 p-4 rounded-full mb-4">
                    <FiClock className="text-rose-600 text-xl" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Flexible Scheduling</h4>
                  <p className="text-gray-600 text-sm">Morning, afternoon and evening appointments available.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">What Our Clients Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Sarah Johnson" 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The meditation program completely transformed my ability to manage stress. I've never felt more centered and focused in my life."
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Michael Chen" 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">Michael Chen</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "After just three energy healing sessions, my chronic back pain improved dramatically. The practitioners are truly gifted."
                </p>
              </div>
            </div>
          </div>

          {/* Wellness Gallery */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Our Wellness Space</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Meditation room" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Yoga class" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Massage room" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Relaxation area" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Begin Your Wellness Journey?</h3>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              Book your first session today and receive 20% off your initial consultation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-teal-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow-md transition-colors duration-300">
                Book a Session
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-lg font-medium transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrainingPage;