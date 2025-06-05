import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaClock, FaCalendarAlt, FaUserMd, FaEuroSign, FaUser } from 'react-icons/fa';

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Specialist');
  const [currentPage, setCurrentPage] = useState(1);
  const specialistsPerPage = 6;

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/schedule');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Function to get profile image URL
const getProfileImageUrl = (specialist) => {
  if (specialist?.specialistId?.profileImageId?.name) {
    const base64String = specialist.specialistId.profileImageId.name;

    // Kontrollo nëse string-u tashmë përmban 'data:image'
    if (base64String.startsWith('data:image')) {
      return base64String;
    }

    // Shto prefix nëse mungon
    return `data:image/jpeg;base64,${base64String}`;
  }
  return null;
};

  // Get specialist name
  const getSpecialistName = (specialist) => {
    if (specialist.specialistId) {
      return `${specialist.specialistId.name} ${specialist.specialistId.lastName}`;
    }
    return specialist.specialistName || 'Unknown Specialist';
  };

  // Get specialist role
  const getSpecialistRole = (specialist) => {
    if (specialist.specialistId?.roleId?.name) {
      return specialist.specialistId.roleId.name;
    }
    return specialist.specialistRole || 'Unknown Role';
  };

  // Get unique roles for dropdown
  const uniqueRoles = ['All Specialist', ...new Set(schedules.map(s => getSpecialistRole(s)))];

  const filteredSchedules = schedules.filter(specialist => {
    const name = getSpecialistName(specialist);
    const role = getSpecialistRole(specialist);
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'All Specialist' || role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Get current specialists
  const indexOfLastSpecialist = currentPage * specialistsPerPage;
  const indexOfFirstSpecialist = indexOfLastSpecialist - specialistsPerPage;
  const currentSpecialists = filteredSchedules.slice(indexOfFirstSpecialist, indexOfLastSpecialist);
  const totalPages = Math.ceil(filteredSchedules.length / specialistsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-900 via-teal-900 to-teal-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-400"></div>
          <div className="absolute inset-0 rounded-full border-4 border-purple-300 opacity-30 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-900 via-red-900 to-red-900">
        <div className="bg-red-900/80 backdrop-blur-lg border border-red-500 text-red-100 px-6 py-4 rounded-2xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const roleColors = {
    'Fizioterapeut': { 
      bg: 'from-emerald-400 to-teal-600', 
      card: 'bg-emerald-50/80', 
      text: 'text-emerald-800', 
      accent: 'emerald-500',
      icon: 'text-emerald-600'
    },
    'Nutricionist': { 
      bg: 'from-amber-400 to-orange-600', 
      card: 'bg-amber-50/80', 
      text: 'text-amber-800', 
      accent: 'amber-500',
      icon: 'text-amber-600'
    },
    'Trajner': { 
      bg: 'from-purple-400 to-indigo-600', 
      card: 'bg-purple-50/80', 
      text: 'text-purple-800', 
      accent: 'purple-500',
      icon: 'text-purple-600'
    },
    'Psikolog': { 
      bg: 'from-blue-400 to-cyan-600', 
      card: 'bg-blue-50/80', 
      text: 'text-blue-800', 
      accent: 'blue-500',
      icon: 'text-blue-600'
    },
    'default': { 
      bg: 'from-slate-400 to-gray-600', 
      card: 'bg-slate-50/80', 
      text: 'text-slate-800', 
      accent: 'slate-500',
      icon: 'text-slate-600'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="absolute top-5 left-5 z-20">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-white/80 hover:text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 transition-all duration-300 hover:bg-white/20"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <FaUserMd className="text-6xl text-teal-300 mx-auto mb-4 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-100 to-white mb-6 animate-gradient">
              Specialist Schedules
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-light">
              Discover our world-class professionals and book your perfect appointment
            </p>
            <div className="mt-8 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-teal-300 to-teal-100 rounded-full"></div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-white/60 group-focus-within:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300"
                  placeholder="Search specialists..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent appearance-none transition-all duration-300"
                >
                  {uniqueRoles.map(role => (
                    <option key={role} value={role} className="bg-gray-800 text-white">{role}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="h-7 w-7 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-12 h-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No specialists found</h3>
              <p className="text-white/60 text-lg">
                {searchTerm || selectedRole !== 'All Specialist' 
                  ? 'Try different search criteria' 
                  : 'No specialists available'}
              </p>
            </div>
          ) : (
            <>
              {/* Specialists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {currentSpecialists.map((specialist) => {
                  const specialistRole = getSpecialistRole(specialist);
                  const specialistName = getSpecialistName(specialist);
                  const profileImageUrl = getProfileImageUrl(specialist);
                  const colors = roleColors[specialistRole] || roleColors.default;
                  
                  return (
                    <div 
                      key={specialist.id || specialist._id} 
                      className="group relative bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden hover:scale-105 hover:bg-white/15 transition-all duration-500 shadow-2xl"
                    >
                      {/* Gradient Header with Profile Image */}
                      <div className={`bg-gradient-to-r ${colors.bg} p-6 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              {/* Profile Image */}
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/30 bg-white/10 flex items-center justify-center">
                                    {profileImageUrl ? (
                                      <img 
                                        src={profileImageUrl} 
                                        alt={specialistName}
                                        className="w-full h-full object-cover object-center"
                                      />
                                    ) : (
                                      <FaUser className="text-2xl text-white/80" />
                                    )}
                                  </div>

                              <FaUserMd className="text-2xl text-white/80" />
                            </div>
                            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                              <span className="text-white text-sm font-medium">{specialistRole}</span>
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">{specialistName}</h3>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 space-y-6">
                        {/* Working Hours */}
                        <div className="flex items-center space-x-3 text-white/80">
                          <FaClock className={`${colors.icon} text-lg`} />
                          <div>
                            <p className="font-medium">{specialist.startTime} - {specialist.endTime}</p>
                            <p className="text-sm text-white/60">Break: {specialist.breakStartTime} - {specialist.breakEndTime}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-3 text-white/80">
                          <FaEuroSign className={`${colors.icon} text-lg`} />
                          <span className="text-2xl font-bold text-white">€{parseFloat(specialist.price).toFixed(2)}</span>
                        </div>

                        {/* Available Days */}
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                            <FaCalendarAlt className={`${colors.icon}`} />
                            <span>Available Days</span>
                          </h4>
                          <div className="grid grid-cols-7 gap-1">
                            {daysOfWeek.map((day) => (
                              <div key={day} className="text-center">
                                <span className="text-xs text-white/60 block mb-1">
                                  {day.substring(0, 1)}
                                </span>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                    specialist.workDays && specialist.workDays.includes(day)
                                      ? `bg-${colors.accent} text-white shadow-lg`
                                      : 'bg-white/10 text-white/40'
                                  }`}
                                >
                                  {specialist.workDays && specialist.workDays.includes(day) ? '✓' : '✗'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Unavailable Dates */}
                        {specialist.unavailableDates && specialist.unavailableDates.length > 0 && (
                          <div>
                            <h4 className="text-white font-semibold mb-2">Unavailable Dates</h4>
                            <div className="flex flex-wrap gap-2">
                              {specialist.unavailableDates.slice(0, 3).map((date) => (
                                <span
                                  key={date}
                                  className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30"
                                >
                                  {new Date(date).toLocaleDateString()}
                                </span>
                              ))}
                              {specialist.unavailableDates.length > 3 && (
                                <span className="text-white/60 text-xs">+{specialist.unavailableDates.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Book Button */}
                        <div className="pt-4">
                          <Link
                            to={`/createappointment?specialist=${encodeURIComponent(specialistName)}`}
                            className={`w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${colors.bg} text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group-hover:scale-105`}
                          >
                            Book Appointment
                            <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {filteredSchedules.length > specialistsPerPage && (
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="text-white/80">
                    Showing <span className="font-semibold text-teal-300">{indexOfFirstSpecialist + 1}</span> to{' '}
                    <span className="font-semibold text-teal-300">
                      {Math.min(indexOfLastSpecialist, filteredSchedules.length)}
                    </span>{' '}
                    of <span className="font-semibold text-teal-300">{filteredSchedules.length}</span> specialists
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-xl transition-all ${currentPage === 1 ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'}`}
                    >
                      Previous
                    </button>
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-all ${
                              currentPage === pageNum 
                                ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white shadow-lg scale-110' 
                                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-xl transition-all ${currentPage === totalPages ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="mt-16 text-center bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
                    Ready to Transform Your Health?
                  </h2>
                  <p className="text-xl text-white/80 mb-8 leading-relaxed">
                    Our expert specialists are here to guide you on your wellness journey. Book your appointment today and experience the difference professional care makes.
                  </p>
                  <Link
                    to="/createappointment"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                  >
                    Book Your Appointment
                    <svg className="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Schedule;