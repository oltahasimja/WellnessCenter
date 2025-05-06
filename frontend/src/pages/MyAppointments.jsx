import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import Header from "./Header";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;
  const navigate = useNavigate();

  // Status color mapping
  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-teal-100 text-teal-800",
    canceled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800"
  };

  // Check login status and user role
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (!response.data.user) {
          navigate('/login');
        } else {
          const userResponse = await axios.get(`http://localhost:5000/api/user/${response.data.user.id}`);
          const userRole = userResponse.data.roleId?.name;
          
          setCurrentUser({
            id: response.data.user.id,
            role: userRole
          });
          setIsSpecialist(['Fizioterapeut', 'Nutricionist', 'Trajner', 'Psikolog'].includes(userRole));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        navigate('/login');
      }
    };
    checkLoginStatus();
  }, [navigate, refresh]);

  // Fetch appointments
  useEffect(() => {
    if (!currentUser) return;
  
    const fetchData = async () => {
      try {
        const appointmentsUrl = isSpecialist
          ? `http://localhost:5000/api/appointment?specialistId=${currentUser.id}`
          : `http://localhost:5000/api/appointment?userId=${currentUser.id}`;
  
        const apptsResponse = await axios.get(appointmentsUrl);
        
        let filteredAppointments = apptsResponse.data;
        if (isSpecialist) {
          switch (currentUser.role) {
            case 'Trajner':
              filteredAppointments = filteredAppointments.filter(appt => appt.type === 'training');
              break;
            case 'Nutricionist':
              filteredAppointments = filteredAppointments.filter(appt => appt.type === 'nutrition');
              break;
            case 'Fizioterapeut':
              filteredAppointments = filteredAppointments.filter(appt => appt.type === 'therapy');
              break;
            case 'Psikolog':
              filteredAppointments = filteredAppointments.filter(appt => appt.type === 'mental_performance');
              break;
          }
        }
        
        setAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Error fetching appointments data");
      }
    };
  
    fetchData();
  }, [currentUser, isSpecialist, refresh]);

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/appointment/${appointmentId}`, {
        status: newStatus
      });
  
      setRefresh(!refresh);
      setSuccessMessage(`Appointment ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      setErrorMessage(`Failed to update appointment: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  // Calculate pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);
  
  // Change page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
      <div className="fixed top-5 left-5 z-50 flex space-x-4">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-teal-700 hover:text-teal-900 transition-all duration-300 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg hover:shadow-xl cursor-pointer border border-teal-100"
        >
          <FaArrowLeft className="text-lg" />
          <span className="font-medium">Back to Home</span>
        </div>
        
        <div 
          onClick={() => navigate('/myappointments')}
          className="flex items-center space-x-2 text-teal-700 hover:text-teal-900 transition-all duration-300 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg hover:shadow-xl cursor-pointer border border-teal-100"
        >
          <FaCalendarAlt className="text-lg" />
          <span className="font-medium">My Appointments</span>
        </div>
      </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 mt-[5rem]">
          <h1 className="text-2xl font-bold text-teal-800 mb-6 text-center">
            {isSpecialist ? 'My Scheduled Appointments' : 'My Appointments'}
          </h1>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-md">
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setErrorMessage('')}
                  className="text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-teal-100 border-l-4 border-teal-500 text-teal-700 p-4 mb-4 rounded shadow-md">
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  {successMessage}
                </p>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-teal-700 hover:text-teal-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isSpecialist ? 'My Appointments' : 'Upcoming Appointments'}
            </h2>
            
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {isSpecialist ? 'You have no appointments scheduled.' : 'You don\'t have any appointments yet.'}
              </p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200">
                  {currentAppointments.map((appt) => {
                    const userName = appt.userId?.name || 'Unknown Client';
                    const userLastName = appt.userId?.lastName || '';
                    const specialistName = appt.specialistId?.name || 'Unknown Specialist';
                    const specialistLastName = appt.specialistId?.lastName || '';
                    const specialistRole = appt.specialistId?.roleId?.name || 'Specialist';
                    const specialistFullName = `${specialistName} ${specialistLastName}`.trim() || 'Unknown Specialist';
                    const userFullName = `${userName} ${userLastName}`.trim() || 'Unknown Client';
                    return (
                      <li key={appt._id} className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <h3 className="font-medium text-gray-800">
                              {isSpecialist ? userFullName : specialistFullName} 
                              <span className="text-sm text-gray-500 ml-2">
                                ({isSpecialist ? 'Client' : specialistRole})
                              </span>
                            </h3>

                            <p className="text-gray-600">
                              Date: {new Date(appt.appointmentDate).toLocaleString()}
                            </p>

                            <p className="text-gray-600">
                              Type: {appt.type.replace('_', ' ')}
                            </p>

                            {appt.notes && (
                              <p className="text-gray-600">
                                Notes: {appt.notes}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appt.status] || 'bg-gray-100'}`}>
                              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>

                            {isSpecialist && appt.status === 'pending' && (
                              <div className="flex space-x-2 mt-2">
                                <button onClick={() => updateAppointmentStatus(appt._id, 'confirmed')}
                                  className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button onClick={() => updateAppointmentStatus(appt._id, 'canceled')}
                                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                {/* Pagination Controls */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                    Showing {indexOfFirstAppointment + 1}-{Math.min(indexOfLastAppointment, appointments.length)} of {appointments.length} appointments
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={goToPreviousPage} 
                      disabled={currentPage === 1}
                      className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-teal-600 hover:bg-teal-50'}`}
                    >
                      Prev
                    </button>
                    <button 
                      onClick={goToNextPage} 
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-teal-600 hover:bg-teal-50'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;