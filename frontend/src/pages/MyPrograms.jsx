import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaAppleAlt, FaArrowRight, FaStar } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
// Add this role mapping at the top of your MyPrograms file
// Role-based image mapping
const roleImageMapping = {
    'psikolog': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'trajner': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'nutricionist': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1453&q=80',
    'fizioterapeut': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'client': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  };
  
  // Helper function to normalize role names
  const normalizeRole = (roleName) => {
    if (!roleName) return 'client';
    
    const lowerCaseRole = roleName.toLowerCase();
    if (lowerCaseRole.includes('psikolog')) return 'psikolog';
    if (lowerCaseRole.includes('trajner')) return 'trajner';
    if (lowerCaseRole.includes('nutricionist')) return 'nutricionist';
    if (lowerCaseRole.includes('fizioterapeut')) return 'fizioterapeut';
    
    return 'client';
  };
function MyPrograms() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [hoveredProgram, setHoveredProgram] = useState(null);
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const normalizeRole = (role) => {
        if (!role) return 'default';

        const roleName = role.toLowerCase();
        if (roleName.includes('psikolog')) return 'psikolog';
        if (roleName.includes('trajner')) return 'trajner';
        if (roleName.includes('nutricionist')) return 'nutricionist';
        if (roleName.includes('fizioterapeut')) return 'fizioterapeut';

        return 'default';
    };


    // Animation variants
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

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get("http://localhost:5000/user", { withCredentials: true });
                if (!response.data.user) {
                    navigate("/login");
                } else {
                    setCurrentUser(response.data.user);
                    fetchUserPrograms(response.data.user.id);
                }
            } catch (error) {
                navigate("/login");
            }
        };

        checkLoginStatus();
    }, [navigate]);

    const fetchUserPrograms = async (userId) => {
        try {
          // Fetch programs and all users (to get creator roles)
          const [programsResponse, usersResponse] = await Promise.all([
            axios.get("http://localhost:5000/api/userprograms"),
            axios.get("http://localhost:5000/api/user") // Endpoint to get all users with their roles
          ]);
    
          const userIdStr = String(userId);
          const userPrograms = programsResponse.data.filter(program => {
            const programUserId = program.userId ? String(program.userId._id) : null;
            const programUserMysqlId = program.userId ? String(program.userId.mysqlId) : null;
            const createdById = program.programId ? String(program.programId.createdById) : null;
            
            return (
              programUserId === userIdStr ||
              programUserMysqlId === userIdStr ||
              createdById === userIdStr
            );
          });
    
          // Enhance programs with creator role information
          const enhancedPrograms = userPrograms.map(program => {
            // Find the creator user
            const creator = usersResponse.data.find(user => 
              user._id === program.programId?.createdById || 
              user.mysqlId === program.programId?.createdById
            );
            
            return {
              ...program,
              creatorName: creator?.name || 'Your Coach',
              creatorRoleName: normalizeRole(creator?.roleId?.name || 'Client')
            };
          });
    
          setPrograms(enhancedPrograms);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };
    
      // Simplified getProgramImage function
      const getProgramImage = (program) => {
        return roleImageMapping[program.creatorRoleName] || roleImageMapping.client;
      };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-16">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative bg-gradient-to-br from-teal-600 to-teal-400 text-white py-16 sm:py-24 px-6 sm:px-8"
            >
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="text-center"
                    >
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
                        >
                            My <span className="text-yellow-300">Wellness</span> Programs
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="mt-6 text-xl leading-8 text-blue-100 max-w-2xl mx-auto"
                        >
                            {currentUser && `Welcome back, ${currentUser.name}! Here are your active wellness programs.`}
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Programs Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-7xl mx-auto px-6 sm:px-8 py-12"
            >
                {currentUser && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mb-8 text-center"
                    >
                        <span className="inline-block px-4 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
                            Active Member
                        </span>
                        <p className="mt-2 text-gray-600">
                            You're enrolled in {programs.length} program{programs.length !== 1 ? 's' : ''}
                        </p>
                    </motion.div>
                )}

                {programs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="mx-auto h-24 w-24 rounded-full bg-teal-50 flex items-center justify-center mb-6">
                            <GiMuscleUp className="text-teal-500 text-4xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Programs Yet</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            You don't have any active wellness programs. Explore our services to get started on your journey.
                        </p>
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/services')}
                            className="inline-block rounded-md bg-teal-600 px-6 py-3 text-lg font-semibold text-white hover:bg-teal-500 transition-all duration-300"
                        >
                            Browse Services
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {programs.map((program) => (
                            <motion.div
                                key={program._id}
                                variants={fadeInUp}
                                onHoverStart={() => setHoveredProgram(program._id)}
                                onHoverEnd={() => setHoveredProgram(null)}
                                whileHover={{
                                    y: -10,
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                }}
                                onClick={() => navigate(`/programs/${program.programId.mysqlId}`)}
                                className={`bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 cursor-pointer ${hoveredProgram === program._id ? 'ring-2 ring-teal-500' : ''
                                    }`}
                            >
                                {/* Card Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <motion.img
                                        initial={{ scale: 1.1 }}
                                        animate={hoveredProgram === program._id ? { scale: 1 } : {}}
                                        className="w-full h-full object-cover"
                                        src={getProgramImage(program, roles)}
                                        alt="Wellness program"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <h3 className="text-xl font-bold text-white">
                                            {program.programId?.title || 'Wellness Program'}
                                        </h3>
                                        <div className="flex mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className="text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                            Active
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Joined {new Date(program.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-4">
                                        {program.programId?.description || 'A comprehensive wellness program designed for your needs.'}
                                    </p>

                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center">
                                                <FaDumbbell className="text-teal-500" />
                                            </div>
                                            <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
  {program.creatorName}
</p>
                                                <p className="text-sm text-gray-500">Coach</p>
                                            </div>
                                        </div>

                                        <div className="inline-flex items-center text-sm font-medium text-teal-600">
                                            View details
                                            <motion.span
                                                animate={hoveredProgram === program._id ? { x: [0, 5, 0] } : {}}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                className="ml-1"
                                            >
                                                <FaArrowRight />
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {/* CTA Section */}
            {programs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-teal-700 to-teal-600 py-12 px-6 sm:px-8"
                >
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                            Need a <span className="text-yellow-300">different</span> program?
                        </h2>
                        <p className="text-lg leading-8 text-blue-100 mb-8">
                            Our experts can create a personalized wellness plan tailored to your specific goals and needs.
                        </p>
                        <motion.div className="flex flex-col sm:flex-row justify-center gap-4">
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 10px 25px -5px rgba(253, 224, 71, 0.3)"
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/services')}
                                className="rounded-md bg-yellow-400 px-6 py-3 text-lg font-semibold text-gray-900 shadow-sm hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 transition-all duration-300"
                            >
                                Explore Services
                            </motion.button>
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: "white",
                                    color: "black"
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/dashboard/createappointment')}
                                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-teal-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300"
                            >
                                Book Consultation
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default MyPrograms;