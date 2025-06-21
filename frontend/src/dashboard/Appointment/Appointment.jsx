import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/ThemeContext";

const Appointments = () => {
  const { theme } = useTheme();
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

  // Status color mapping with dark mode support
  const statusColors = {
    pending: theme === 'dark' ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800",
    confirmed: theme === 'dark' ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800",
    canceled: theme === 'dark' ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800",
    completed: theme === 'dark' ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
  };

  // Check login status and user role
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user', { withCredentials: true });
        if (!response.data.user) {
          navigate('/login');
        } else {
          const userResponse = await axios.get(`http://localhost:5001/api/user/${response.data.user.id}`);
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
          ? `http://localhost:5001/api/appointment?specialistId=${currentUser.id}`
          : `http://localhost:5001/api/appointment?userId=${currentUser.id}`;
  
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
      await axios.put(`http://localhost:5001/api/appointment/${appointmentId}`, {
        status: newStatus
      });
  
      setRefresh(!refresh);
      setSuccessMessage(`Appointment ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      setErrorMessage(`Failed to update appointment: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleAppointmentCreated = () => {
    setRefresh(!refresh);
    setSuccessMessage('Appointment created successfully!');
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
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
        <h2 className={`text-3xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {isSpecialist ? 'My Scheduled Appointments' : 'My Appointments'}
        </h2>

        {/* Error Message */}
        {errorMessage && (
          <div className={`mb-4 p-4 rounded border-l-4 ${theme === 'dark' ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-100 border-red-500 text-red-700'}`}>
            <div className="flex justify-between items-center">
              <p>{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage('')}
                className={theme === 'dark' ? 'text-red-200 hover:text-red-100' : 'text-red-700 hover:text-red-900'}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className={`mb-4 p-4 rounded border-l-4 ${theme === 'dark' ? 'bg-green-900/30 border-green-700 text-green-200' : 'bg-green-100 border-green-500 text-green-700'}`}>
            <div className="flex justify-between items-center">
              <p>{successMessage}</p>
              <button 
                onClick={() => setSuccessMessage('')}
                className={theme === 'dark' ? 'text-green-200 hover:text-green-100' : 'text-green-700 hover:text-green-900'}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {isSpecialist ? 'My Appointments' : 'Upcoming Appointments'}
          </h3>
          
          {appointments.length === 0 ? (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {isSpecialist ? 'You have no appointments scheduled.' : 'You don\'t have any appointments yet.'}
            </p>
          ) : (
            <>
              <ul className="space-y-4 mb-6">
                {currentAppointments.map((appt) => {
                  const userName = appt.userId?.name || 'Unknown Client';
                  const userLastName = appt.userId?.lastName || '';
                  const specialistName = appt.specialistId?.name || 'Unknown Specialist';
                  const specialistLastName = appt.specialistId?.lastName || '';
                  const specialistRole = appt.specialistId?.roleId?.name || 'Specialist';
                  const specialistFullName = `${specialistName} ${specialistLastName}`.trim() || 'Unknown Specialist';
                  const userFullName = `${userName} ${userLastName}`.trim() || 'Unknown Client';

                  return (
                    <li 
                      key={appt._id} 
                      className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border shadow-sm transition-all hover:shadow-md`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {isSpecialist ? userFullName : specialistFullName} 
                            <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              ({isSpecialist ? 'Client' : specialistRole})
                            </span>
                          </div>
                          <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                            <span className="font-medium">Date:</span> {new Date(appt.appointmentDate).toLocaleString()}
                          </div>
                          <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                            <span className="font-medium">Type:</span> <span className="capitalize">{appt.type.replace('_', ' ')}</span>
                          </div>
                          {appt.notes && (
                            <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                              <span className="font-medium">Notes:</span> {appt.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`px-3 py-1 text-sm rounded-full mb-2 ${statusColors[appt.status]}`}>
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </div>
                          {isSpecialist && appt.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => updateAppointmentStatus(appt._id, 'confirmed')}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => updateAppointmentStatus(appt._id, 'canceled')}
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
              <div className="flex justify-between items-center mt-6">
                <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Showing {indexOfFirstAppointment + 1}-{Math.min(indexOfLastAppointment, appointments.length)} of {appointments.length} appointments
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1 
                        ? (theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400') 
                        : (theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')
                    } transition-colors`}
                  >
                    Prev
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === totalPages 
                        ? (theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400') 
                        : (theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')
                    } transition-colors`}
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
  );
};

export default Appointments;