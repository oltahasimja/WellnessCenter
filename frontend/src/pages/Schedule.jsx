import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHome } from 'react-icons/fa';

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Specialist');
  const [currentPage, setCurrentPage] = useState(1);
  const specialistsPerPage = 5;

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

  // Get unique roles for dropdown
  const uniqueRoles = ['All Specialist', ...new Set(schedules.map(s => s.specialistRole))];

  const filteredSchedules = schedules.filter(specialist => {
    const matchesSearch = specialist.specialistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialist.specialistRole.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'All Specialist' || specialist.specialistRole === selectedRole;
    
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="bg-rose-100 border border-rose-400 text-rose-800 px-4 py-3 rounded-lg shadow-md">
          Error: {error}
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const roleColors = {
    'Fizioterapeut': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    'Nutricionist': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'Trajner': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    'default': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="absolute top-5 left-5 z-10">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-blue-300 transition-colors duration-300"
          >
            <FaArrowLeft className="text-lg" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Specialist Schedules
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-teal-700">
            View the working hours of our professional team
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search specialists by name or role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none"
            >
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No specialists found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || selectedRole !== 'All Specialist' 
                ? 'Try different search criteria' 
                : 'No specialists available'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {currentSpecialists.map((specialist) => {
                const colors = roleColors[specialist.specialistRole] || roleColors.default;
                
                return (
                  <div 
                    key={specialist.id} 
                    className={`rounded-xl shadow-lg overflow-hidden border ${colors.border} transition-all hover:shadow-xl`}
                  >
                    <div className={`${colors.bg} px-6 py-4`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">{specialist.specialistName}</h2>
                          <p className={`text-lg ${colors.text} font-medium`}>{specialist.specialistRole}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 bg-white bg-opacity-70 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg border border-white border-opacity-30">
                          <p className="font-medium">
                            Working Hours: {specialist.startTime} - {specialist.endTime}
                          </p>
                          <p className="text-sm">
                            Break: {specialist.breakStartTime} - {specialist.breakEndTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8">
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Available Days</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                          {daysOfWeek.map((day) => (
                            <div key={day} className="flex flex-col items-center">
                              <span className="text-sm font-medium text-gray-500">
                                {day.substring(0, 3)}
                              </span>
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 transition-all ${
                                  specialist.workDays.includes(day)
                                    ? `${colors.bg} ${colors.text}`
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {specialist.workDays.includes(day) ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {specialist.unavailableDates && specialist.unavailableDates.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-800 mb-2">Unavailable Dates</h3>
                          <div className="flex flex-wrap gap-2">
                            {specialist.unavailableDates.map((date) => (
                              <span
                                key={date}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800"
                              >
                                {new Date(date).toLocaleDateString()}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                      )}
                    </div>
                    <div className="mt-6 text-right">
                        <Link
                          to={`/createappointment?specialist=${specialist.specialistName}`}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-500 mb-[5px] mr-[5px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200`}
                        >
                          Book Appointment To this Specialist
                          <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredSchedules.length > specialistsPerPage && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstSpecialist + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastSpecialist, filteredSchedules.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredSchedules.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-teal-600 hover:bg-teal-50'}`}
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentPage === number ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 hover:bg-teal-50'}`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-teal-600 hover:bg-teal-50'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Ready to Book Section */}
            <div className="mt-16 text-center bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Book Your Appointment?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Found the perfect specialist? Book your appointment now and take the first step towards your wellness journey.
              </p>
              <Link
                to="/createappointment"
                className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
              >
                Book Now
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Schedule;