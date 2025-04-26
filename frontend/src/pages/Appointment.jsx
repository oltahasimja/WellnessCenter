import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaAppleAlt, FaBrain, FaRunning, FaQuoteLeft, FaArrowRight, FaArrowLeft, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { MdPsychology } from 'react-icons/md';
import { RiMentalHealthLine } from 'react-icons/ri';
import Slider from 'react-slick';
import Header from './Header';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';

axios.defaults.withCredentials = true;

// Enhanced animations with smoother transitions
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    } 
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    } 
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.03, 1],
    transition: { 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    } 
  }
};

const WellnessCenter = () => {
  const [hoveredService, setHoveredService] = useState(null);
  const [hoveredTeam, setHoveredTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/');
        // Filter users who have a role AND are not Clients
        const experts = response.data.filter(user => 
          user.roleId && user.roleId.name !== 'Client'
        );
        
        const formattedExperts = experts.map(user => ({
          id: user._id || user.mysqlId,
          name: `${user.name} ${user.lastName}`,
          role: user.roleId?.name || 'Specialist',
          specialty: user.roleId?.name || 'Wellness Expert', 
          image: user.profileImageId 
            ? `data:image/jpeg;base64,${user.profileImageId.name}` 
            : `https://ui-avatars.com/api/?name=${user.name}+${user.lastName}&background=random`,
          bgColor: getRandomBgColor() 
        }));
        
        setTeamMembers(formattedExperts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members');
        setLoading(false);
      }
    };
  
    fetchTeamMembers();
  }, []);
    const getRandomBgColor = () => {
      const colors = [
        'bg-blue-100',
        'bg-emerald-100',
        'bg-amber-100',
        'bg-purple-100',
        'bg-pink-100',
        'bg-indigo-100'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    

  // Slider settings with enhanced effects
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
    fade: true,
    cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)"
  };

  // Updated services with refined colors
  const services = [
    {
      id: 1,
      title: "Personal Training",
      description: "Customized workout programs designed by certified trainers to help you achieve your fitness goals.",
      icon: <FaDumbbell className="text-4xl text-blue-500" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:shadow-blue-200",
      features: [
        "Strength training",
        "Cardio programs",
        "Functional fitness",
        "Posture correction"
      ]
    },
    {
      id: 2,
      title: "Nutrition Counseling",
      description: "Personalized meal plans and nutritional guidance to complement your wellness journey.",
      icon: <FaAppleAlt className="text-4xl text-emerald-500" />,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      hoverColor: "hover:shadow-emerald-200",
      features: [
        "Diet analysis",
        "Meal planning",
        "Weight management",
        "Sports nutrition"
      ]
    },
    {
      id: 3,
      title: "Psychology Services",
      description: "Professional mental health support to help you achieve balance and wellbeing.",
      icon: <MdPsychology className="text-4xl text-purple-500" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:shadow-purple-200",
      features: [
        "Stress management",
        "Cognitive therapy",
        "Mindfulness training",
        "Life coaching"
      ]
    },
    {
      id: 4,
      title: "Physiotherapy",
      description: "Specialized treatments to restore movement and function when affected by injury or disability.",
      icon: <FaRunning className="text-4xl text-amber-500" />,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      hoverColor: "hover:shadow-amber-200",
      features: [
        "Pain management",
        "Rehabilitation",
        "Post-surgery recovery",
        "Mobility improvement"
      ]
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Fitness Client",
      content: "The wellness center transformed my life. The trainers and nutritionists worked together to create a perfect plan for me. I've never felt better!",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Physiotherapy Patient",
      content: "After my knee surgery, the physiotherapists here helped me regain full mobility faster than I expected. Their expertise is unmatched.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Nutrition Client",
      content: "The nutritional guidance I received was life-changing. I've never felt better or had more energy! The team truly cares about your success.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5
    }
  ];

 

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white overflow-hidden">

<Header />

      {/* Hero Section with enhanced animations */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative bg-gradient-to-br from-teal-600 to-teal-400 text-white overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 - 50, 
                y: Math.random() * 100, 
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0.1 + Math.random() * 0.3
              }}
              animate={{ 
                y: [null, Math.random() * -100 - 50],
                opacity: [null, 0],
                rotate: [0, 180]
              }}
              transition={{ 
                duration: 15 + Math.random() * 15, 
                repeat: Infinity, 
                ease: "linear"
              }}
              className="absolute rounded-full bg-white bg-opacity-10"
              style={{ 
                width: `${30 + Math.random() * 70}px`, 
                height: `${30 + Math.random() * 70}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="relative z-10 pb-16 sm:pb-24 md:pb-32 lg:max-w-2xl lg:w-full lg:pb-40 xl:pb-48 px-6 py-24 sm:py-32 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="text-left"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
              >
                Your Journey to 
                <motion.span 
                  animate={{ 
                    color: ['#fef08a', '#fde047', '#fef08a'],
                    textShadow: ['0 0 8px rgba(254,240,138,0.3)', '0 0 15px rgba(254,240,138,0.5)', '0 0 8px rgba(254,240,138,0.3)']
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                  className="text-yellow-300 ml-2 inline-block"
                >
                  Total Wellness
                </motion.span>
                <br />Begins Here
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-xl leading-8 text-blue-100 max-w-2xl"
              >
                Discover our integrated approach to health with expert services in training, nutrition, psychology, and physiotherapy.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="mt-10 flex items-center gap-x-6"
              >
                <motion.a
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "#fde047",
                    boxShadow: "0 10px 25px -5px rgba(253, 224, 71, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ boxShadow: "0 0 0 rgba(253, 224, 71, 0)" }}
                  animate={{ 
                    boxShadow: ["0 0 0 rgba(253, 224, 71, 0)", "0 0 25px rgba(253, 224, 71, 0.4)", "0 0 0 rgba(253, 224, 71, 0)"]
                  }}
                  transition={{ 
                    boxShadow: { 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    } 
                  }}
                //   href="#services"
                href='/dashboard/createappointment'
                  className="rounded-md bg-yellow-400 px-6 py-3 text-lg font-semibold text-gray-900 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 transition-all duration-300"
                >
                  Book Now
                </motion.a>
                <motion.a 
                  whileHover={{ x: 5 }}
                  target='_blank'
                  href="/schedule" 
                  className="text-lg font-semibold leading-6 text-white hover:text-yellow-200 transition-all duration-300 flex items-center"
                >
                  Schedule
                  <motion.span 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    aria-hidden="true"
                    className="ml-1"
                  >→</motion.span>
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          className="absolute inset-y-0 right-0 hidden lg:block w-1/2"
        >
          <div className="absolute inset-0 bg-gradient-to-l from-blue-600 to-purple-600 opacity-80"></div>
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: [1.05, 1, 1.05] }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Wellness center"
          />
        </motion.div>
      </motion.div>

      {/* Stats with refined animations */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {[
              { value: "2,500+", label: "Clients Transformed", color: "text-blue-500", bgColor: "bg-blue-50" },
              { value: "15+", label: "Years Experience", color: "text-emerald-500", bgColor: "bg-emerald-50" },
              { value: "12", label: "Expert Specialists", color: "text-purple-500", bgColor: "bg-purple-50" },
              { value: "98%", label: "Client Satisfaction", color: "text-amber-500", bgColor: "bg-amber-50" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                className={`${stat.bgColor} px-4 py-8 rounded-xl shadow-sm transition-all duration-300`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stat.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: [0.9, 1.05, 1],
                      y: [0, -5, 0]
                    }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className={`${stat.color} text-4xl font-bold sm:text-5xl`}
                  >
                    {stat.value}
                  </motion.div>
                </AnimatePresence>
                <div className="mt-2 text-lg font-medium text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Services Section with enhanced hover effects */}
      <motion.div 
        id="services"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 sm:py-24 px-6 sm:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <motion.span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-3">
                Our Expertise
              </motion.span>
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our <span className="text-teal-500">Integrated</span> Services
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Comprehensive care for your body and mind through our specialized services.
            </p>
          </motion.div>

          <Slider {...settings} className="px-4">
            {services.map((service) => (
              <div key={service.id} className="px-2">
                <motion.div
                  onHoverStart={() => setHoveredService(service.id)}
                  onHoverEnd={() => setHoveredService(null)}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`${service.bgColor} border ${service.borderColor} p-8 rounded-2xl shadow-lg h-full relative overflow-hidden transition-all duration-300`}
                >
                  {/* Animated background pattern */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredService === service.id ? 0.1 : 0 }}
                    className="absolute inset-0 overflow-hidden"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                        style={{ 
                          position: 'absolute',
                          width: `${140 + i * 60}px`, 
                          height: `${140 + i * 60}px`,
                          left: `${-70 + Math.random() * 100}%`,
                          top: `${-70 + Math.random() * 100}%`,
                          borderRadius: '40%',
                          border: `2px solid rgba(0,0,0,0.05)`,
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Icon with enhanced animation */}
                  <motion.div 
                    whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.2 }}
                    className="flex justify-center mb-6 relative z-10"
                  >
                    <motion.div
                      initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
                      animate={{ 
                        boxShadow: hoveredService === service.id ? 
                          ["0 0 0 rgba(0,0,0,0)", "0 0 25px rgba(0,0,0,0.15)", "0 0 0 rgba(0,0,0,0)"] : 
                          "0 0 0 rgba(0,0,0,0)"
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-4 rounded-full bg-white shadow-sm"
                    >
                      {service.icon}
                    </motion.div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 text-center mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        className="flex items-center"
                      >
                        <motion.svg 
                          initial={{ scale: 1 }}
                          animate={hoveredService === service.id ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.5 + index * 0.1, repeat: hoveredService === service.id ? Infinity : 0, repeatDelay: 1 }}
                          className="h-5 w-5 text-emerald-500 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </motion.svg>
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="text-center mt-6">
                    <motion.a
                      whileHover={{ x: 5 }}
                      href="#contact"
                      className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
                    >
                      Learn more 
                      <motion.span
                        animate={hoveredService === service.id ? { x: [0, 5, 0] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <FaArrowRight className="ml-2" />
                      </motion.span>
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </motion.div>

      {/* Approach Section with refined animations */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 sm:py-24 px-6 sm:px-8 bg-white relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                rotate: Math.random() * 360,
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                scale: 0.5 + Math.random() * 1
              }}
              animate={{ 
                rotate: [null, Math.random() * 360 + 90],
                scale: [null, 0.8 + Math.random() * 0.5]
              }}
              transition={{ 
                duration: 20 + Math.random() * 20, 
                repeat: Infinity, 
                ease: "linear",
                repeatType: "reverse"
              }}
              className="absolute"
              style={{ 
                width: `${50 + Math.random() * 100}px`,
                height: `${50 + Math.random() * 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                borderRadius: Math.random() > 0.5 ? '50%' : `${Math.random() * 40}%`,
                background: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 200 + 55}, 0.1)`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div 
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-12 lg:mb-0"
            >
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block"
              >
                <motion.span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-3">
                  Our Philosophy
                </motion.span>
              </motion.div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our <span className="text-teal-500">Holistic</span> Approach
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                At our wellness center, we believe true health comes from addressing all aspects of wellbeing.
              </p>
              <div className="mt-10 space-y-6">
                {[
                  {
                    icon: <RiMentalHealthLine className="h-8 w-8 text-purple-500" />,
                    title: "Mind-Body Connection",
                    text: "We emphasize the powerful connection between mental and physical health in all our programs."
                  },
                  {
                    icon: <GiMuscleUp className="h-8 w-8 text-blue-500" />,
                    title: "Evidence-Based Methods",
                    text: "All our therapies and training programs are based on the latest scientific research."
                  },
                  {
                    icon: <FaBrain className="h-8 w-8 text-emerald-500" />,
                    title: "Personalized Plans",
                    text: "Every client receives a customized program tailored to their unique needs and goals."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}
                    className="flex bg-gray-50 p-6 rounded-lg border border-gray-100 transition-all duration-300"
                  >
                    <motion.div 
                      whileHover={{ rotate: 5 }}
                      className="flex-shrink-0 p-3 rounded-full bg-white shadow-sm"
                    >
                      {item.icon}
                    </motion.div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                      <p className="mt-2 text-gray-600">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-w-16 aspect-h-9 overflow-hidden rounded-2xl shadow-xl"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.2 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 z-10 mix-blend-overlay"
                />
                <motion.img
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Wellness approach"
                />
              </motion.div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm transition-all duration-300"
                >
                  <div className="text-blue-500 text-3xl font-bold">15+</div>
                  <div className="text-gray-700 mt-2">Years Combined Experience</div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="bg-purple-50 border border-purple-100 p-6 rounded-xl shadow-sm transition-all duration-300"
                >
                  <div className="text-purple-500 text-3xl font-bold">100%</div>
                  <div className="text-gray-700 mt-2">Certified Specialists</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Team Section with enhanced hover animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 sm:py-24 px-6 sm:px-8 bg-gray-50"
      >
         <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet Our <span className="text-teal-400">Experts</span>
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Our team of certified professionals is dedicated to your wellness journey.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : (
            <Slider {...settings} className="px-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="px-2">
                  <motion.div
                    onHoverStart={() => setHoveredTeam(member.id)}
                    onHoverEnd={() => setHoveredTeam(null)}
                    whileHover={{ 
                      y: -10,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                    }}
                    className="bg-white p-6 rounded-2xl shadow-lg text-center h-full transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-6 relative"
                    >
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        className="h-full w-full object-cover"
                        src={member.image}
                        alt={member.name}
                      />
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
                      >
                        <motion.span 
                          initial={{ y: 20 }}
                          whileHover={{ y: 0 }}
                          className="text-white font-medium"
                        >
                          View Profile
                        </motion.span>
                      </motion.div>
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    {/* <p className="text-blue-600 font-medium mt-2">{member.role}</p> */}
                    <p className="text-gray-500 mt-2">{member.specialty}</p>
                    <div className="mt-6">
                      <motion.a
                        whileHover={{ x: 5 }}
                        href="#contact"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-300"
                      >
                        View profile <FaArrowRight className="ml-2" />
                      </motion.a>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </motion.div>

      {/* Testimonials with refined fade effect */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 sm:py-24 px-6 sm:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Success <span className="text-teal-400">Stories</span>
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Hear from our clients about their wellness journeys.
            </p>
          </motion.div>

          <Slider {...testimonialSettings} className="max-w-4xl mx-auto px-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="px-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 p-8 rounded-2xl shadow-lg transition-all duration-300"
                >
                  <div className="flex">
                    <FaQuoteLeft className="text-gray-300 text-2xl" />
                    <p className="text-gray-600 text-lg ml-4">{testimonial.content}</p>
                  </div>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="mt-8 flex items-center"
                  >
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-base text-gray-500">{testimonial.role}</div>
                      <div className="flex mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className="text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </motion.div>

      {/* CTA Section with refined pulse animation */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        id="contact" 
        className="bg-gradient-to-r from-teal-700 to-teal-600 py-16 sm:py-24 px-6 sm:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ x: -50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12 lg:mb-0"
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Book Your <motion.span 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-yellow-300 inline-block"
                >
                  Appointment
                </motion.span>?
              </h2>
              <p className="mt-6 text-lg leading-8 text-blue-100">
                Contact us today to schedule a consultation with our experts.
              </p>
              <div className="mt-10">
                <motion.a
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(253, 224, 71, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  href="/dashboard/createappointment"
                  className="rounded-md bg-yellow-400 px-6 py-3 text-lg font-semibold text-gray-900 shadow-sm hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 transition-all duration-300 inline-block"
                >
                  Book Now
                </motion.a>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />,
                    content: <>
                      <p className="font-medium">123 Wellness Avenue</p>
                      <p className="text-gray-500">Health City, HC 54321</p>
                    </>
                  },
                  {
                    icon: <FaPhone className="h-6 w-6 text-blue-600" />,
                    content: <>
                      <p className="font-medium">+1 (555) 123-4567</p>
                      <p className="text-gray-500">Mon-Fri: 8:00 AM - 6:00 PM</p>
                    </>
                  },
                  {
                    icon: <FaEnvelope className="h-6 w-6 text-blue-600" />,
                    content: <>
                      <p className="font-medium">info@wellnesscenter.com</p>
                      <p className="text-gray-500">support@wellnesscenter.com</p>
                    </>
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-start transition-all duration-300"
                  >
                    <div className="flex-shrink-0 pt-1">
                      {item.icon}
                    </div>
                    <div className="ml-3 text-base">
                      {item.content}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WellnessCenter;