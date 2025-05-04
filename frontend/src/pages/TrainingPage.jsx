import { useState } from 'react';
import { FiClock, FiCalendar, FiUser, FiStar, FiHeart, FiShare2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Footer from './Footer';

const TrainingPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample data - in a real app this would come from an API
  const trainingPrograms = [
    {
      id: 1,
      title: "Morning Yoga Flow",
      description: "Start your day with this energizing vinyasa flow that combines breath with movement to build heat, increase flexibility, and calm the mind. Perfect for all levels with modifications available.",
      price: 15,
      duration: "60 min",
      category: "yoga",
      level: "All Levels",
      trainer: "Sarah Johnson",
      rating: 4.8,
      image: "/yoga-morning.jpg",
      schedule: [
        { day: "Monday", time: "7:00 AM" },
        { day: "Wednesday", time: "7:00 AM" },
        { day: "Friday", time: "7:00 AM" }
      ]
    },
    {
      id: 2,
      title: "High Intensity Interval Training",
      description: "This HIIT class alternates between bursts of intense anaerobic exercise with short recovery periods. Burn maximum calories in minimum time while improving cardiovascular health.",
      price: 20,
      duration: "45 min",
      category: "fitness",
      level: "Intermediate",
      trainer: "Mike Rodriguez",
      rating: 4.6,
      image: "/hiit-class.jpg",
      schedule: [
        { day: "Tuesday", time: "6:00 PM" },
        { day: "Thursday", time: "6:00 PM" },
        { day: "Saturday", time: "10:00 AM" }
      ]
    },
    {
      id: 3,
      title: "Mindful Meditation",
      description: "Learn techniques to reduce stress and increase focus through guided meditation. This class will teach you breathing exercises and mindfulness practices you can incorporate into daily life.",
      price: 12,
      duration: "30 min",
      category: "meditation",
      level: "All Levels",
      trainer: "Priya Patel",
      rating: 4.9,
      image: "/meditation.jpg",
      schedule: [
        { day: "Monday", time: "12:00 PM" },
        { day: "Wednesday", time: "12:00 PM" },
        { day: "Sunday", time: "9:00 AM" }
      ]
    },
    {
      id: 4,
      title: "Pilates Reformer",
      description: "Improve core strength, posture, and flexibility using the reformer machine. This low-impact workout is excellent for injury recovery and prevention while building long, lean muscles.",
      price: 25,
      duration: "50 min",
      category: "pilates",
      level: "All Levels",
      trainer: "Emma Wilson",
      rating: 4.7,
      image: "/pilates.jpg",
      schedule: [
        { day: "Tuesday", time: "9:00 AM" },
        { day: "Thursday", time: "9:00 AM" },
        { day: "Saturday", time: "11:00 AM" }
      ]
    },
    {
      id: 5,
      title: "Spin & Core",
      description: "Combine high-energy cycling with targeted core work for a complete cardio and strength session. Adjustable resistance makes this class suitable for all fitness levels.",
      price: 18,
      duration: "55 min",
      category: "fitness",
      level: "All Levels",
      trainer: "David Chen",
      rating: 4.5,
      image: "/spin-class.jpg",
      schedule: [
        { day: "Monday", time: "6:30 PM" },
        { day: "Wednesday", time: "6:30 PM" },
        { day: "Friday", time: "5:30 PM" }
      ]
    },
    {
      id: 6,
      title: "Restorative Yoga",
      description: "A deeply relaxing practice using props to support the body in passive poses that promote healing and stress relief. Perfect for those needing to slow down and restore balance.",
      price: 15,
      duration: "75 min",
      category: "yoga",
      level: "All Levels",
      trainer: "Sarah Johnson",
      rating: 4.9,
      image: "/restorative-yoga.jpg",
      schedule: [
        { day: "Sunday", time: "4:00 PM" }
      ]
    }
  ];

  const trainers = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialty: "Yoga & Mindfulness",
      bio: "500hr RYT with 10 years experience teaching various yoga styles. Passionate about making yoga accessible to all bodies.",
      image: "/trainer1.jpg"
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      specialty: "HIIT & Strength Training",
      bio: "Certified personal trainer with a background in competitive athletics. Focuses on functional fitness and proper form.",
      image: "/trainer2.jpg"
    },
    {
      id: 3,
      name: "Priya Patel",
      specialty: "Meditation & Breathwork",
      bio: "Mindfulness coach trained in multiple meditation traditions. Helps students develop sustainable daily practices.",
      image: "/trainer3.jpg"
    },
    {
      id: 4,
      name: "Emma Wilson",
      specialty: "Pilates & Posture",
      bio: "Certified Pilates instructor with a focus on rehabilitation and body alignment. Former physical therapist assistant.",
      image: "/trainer4.jpg"
    },
    {
      id: 5,
      name: "David Chen",
      specialty: "Cycling & Endurance",
      bio: "Former competitive cyclist who brings energy and motivation to every class. Believes in the power of community in fitness.",
      image: "/trainer5.jpg"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Classes' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'pilates', name: 'Pilates' }
  ];

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredPrograms = selectedCategory === 'all' 
    ? trainingPrograms 
    : trainingPrograms.filter(program => program.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-teal-700 py-20">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Wellness Training Programs</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">
            Discover classes designed to strengthen your body, calm your mind, and nourish your soul.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('classes')}
              className={`${activeTab === 'classes' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Classes
            </button>
            <button
              onClick={() => setActiveTab('trainers')}
              className={`${activeTab === 'trainers' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Trainers
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`${activeTab === 'schedule' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Weekly Schedule
            </button>
          </nav>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category.id ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={program.image} 
                    alt={program.title} 
                    className="w-full h-48 object-cover"
                  />
                  <button 
                    onClick={() => toggleFavorite(program.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full ${favorites.includes(program.id) ? 'bg-red-100 text-red-500' : 'bg-white text-gray-400'} hover:bg-red-100 hover:text-red-500 transition-colors`}
                  >
                    <FiHeart className={`${favorites.includes(program.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                    <span className="flex items-center text-yellow-500">
                      <FiStar className="fill-current mr-1" />
                      {program.rating}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <FiUser className="mr-1" />
                    <span className="mr-4">{program.trainer}</span>
                    <FiClock className="mr-1" />
                    <span>{program.duration}</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className={`text-gray-600 text-sm ${expandedDescription ? '' : 'line-clamp-3'}`}>
                      {program.description}
                    </p>
                    <button 
                      onClick={() => setExpandedDescription(!expandedDescription)}
                      className="text-teal-600 text-sm font-medium mt-1 flex items-center"
                    >
                      {expandedDescription ? (
                        <>
                          Show less <FiChevronUp className="ml-1" />
                        </>
                      ) : (
                        <>
                          Read more <FiChevronDown className="ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-teal-600">€{program.price}</span>
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trainers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={trainer.image} 
                  alt={trainer.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{trainer.name}</h3>
                  <p className="text-teal-600 font-medium mb-4">{trainer.specialty}</p>
                  <p className="text-gray-600 text-sm mb-4">{trainer.bio}</p>
                  <div className="flex space-x-2">
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1">
                      View Classes
                    </button>
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      <FiShare2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Class Schedule</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monday</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuesday</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wednesday</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thursday</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Friday</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saturday</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sunday</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Morning */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6:00 AM - 9:00 AM</td>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const classes = trainingPrograms.filter(program => 
                          program.schedule.some(s => s.day === day && s.time.includes('AM') && !s.time.includes('12:00')));
                        return (
                          <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classes.map(c => (
                              <div key={c.id} className="mb-2 p-2 bg-teal-50 rounded">
                                <div className="font-medium text-teal-800">{c.title}</div>
                                <div className="text-xs">{c.time}</div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Midday */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">12:00 PM - 2:00 PM</td>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const classes = trainingPrograms.filter(program => 
                          program.schedule.some(s => s.day === day && (s.time.includes('12:00') || s.time.includes('1:00'))));
                        return (
                          <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classes.map(c => (
                              <div key={c.id} className="mb-2 p-2 bg-teal-50 rounded">
                                <div className="font-medium text-teal-800">{c.title}</div>
                                <div className="text-xs">{c.time}</div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Evening */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5:00 PM - 8:00 PM</td>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const classes = trainingPrograms.filter(program => 
                          program.schedule.some(s => s.day === day && s.time.includes('PM') && !s.time.includes('12:00')));
                        return (
                          <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classes.map(c => (
                              <div key={c.id} className="mb-2 p-2 bg-teal-50 rounded">
                                <div className="font-medium text-teal-800">{c.title}</div>
                                <div className="text-xs">{c.time}</div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

     {/* CTA Section 
      <div className="bg-teal-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Wellness Journey?</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
            Join our community today and experience the benefits of our expert-led classes and programs.
          </p>
          <button className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 rounded-md text-lg font-bold transition-colors">
            Sign Up Now
          </button>
        </div>
      </div>
      */}
      <Footer />
      
    </div>
  );
};

export default TrainingPage;