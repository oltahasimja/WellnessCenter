import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import Header from "./Header";
import AppointmentItem from "./AppointmentItem";

const Appointments = () => {
  const [bookedToMe, setBookedToMe] = useState([]);
  const [bookedByMe, setBookedByMe] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState("toMe");
  const navigate = useNavigate();

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-teal-100 text-teal-800",
    canceled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800"
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (!res.data.user) return navigate('/login');

        const userRes = await axios.get(`http://localhost:5000/api/user/${res.data.user.id}`);
        const userRole = userRes.data.roleId?.name;

        setCurrentUser({
          id: res.data.user.id,
          role: userRole
        });

        setIsSpecialist(['Fizioterapeut', 'Nutricionist', 'Trajner', 'Psikolog'].includes(userRole));
        setLoading(false);
      } catch (err) {
        console.error("Login check error:", err);
        navigate('/login');
      }
    };

    checkLoginStatus();
  }, [navigate, refresh]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const [asSpecialist, asClient] = await Promise.all([
          axios.get(`http://localhost:5000/api/appointment?specialistId=${currentUser.id}`),
          axios.get(`http://localhost:5000/api/appointment?userId=${currentUser.id}`)
        ]);

        const filterByRole = (list) => {
          switch (currentUser.role) {
            case 'Trajner':
              return list.filter(a => a.type === 'training');
            case 'Nutricionist':
              return list.filter(a => a.type === 'nutrition');
            case 'Fizioterapeut':
              return list.filter(a => a.type === 'therapy');
            case 'Psikolog':
              return list.filter(a => a.type === 'mental_performance');
            default:
              return list;
          }
        };

        setBookedToMe(filterByRole(asSpecialist.data));
        setBookedByMe(asClient.data); 
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setErrorMessage("Failed to load appointments");
      }
    };

    fetchData();
  }, [currentUser, isSpecialist, refresh]);

const updateAppointmentStatus = async (appointmentId, newStatus, reason = "") => {
  try {
    await axios.put(`http://localhost:5000/api/appointment/${appointmentId}`, {
      status: newStatus,
      cancelReason: reason
    });
    setRefresh(prev => !prev);
    setSuccessMessage(`Appointment ${newStatus} successfully!`);
  } catch (error) {
    setErrorMessage("Failed to update status");
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
          {isSpecialist ? 'Appointments Overview' : 'My Appointments'}
        </h1>

        {/* Butonat për specialistin */}
        {isSpecialist && (
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setSelectedTab("toMe")}
              className={`px-4 py-2 rounded-lg border ${
                selectedTab === "toMe"
                  ? "bg-teal-500 text-white"
                  : "bg-white text-teal-700 border-teal-300"
              }`}
            >
              Booked To Me
            </button>
            <button
              onClick={() => setSelectedTab("byMe")}
              className={`px-4 py-2 rounded-lg border ${
                selectedTab === "byMe"
                  ? "bg-teal-500 text-white"
                  : "bg-white text-teal-700 border-teal-300"
              }`}
            >
              Booked By Me
            </button>
          </div>
        )}

        {/* Mesazhe */}
        {errorMessage && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="bg-teal-100 text-teal-800 p-4 rounded mb-4">{successMessage}</div>
        )}

        {/* Specialist View */}
        {isSpecialist && (
          <>
            {selectedTab === "toMe" ? (
              <>
                <h2 className="text-lg font-bold text-teal-800 mt-6 mb-3">
                  Appointments Booked <u>To Me</u>
                </h2>
                {bookedToMe.length === 0 ? (
                  <p className="text-gray-500 mb-4">No clients have booked you yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {bookedToMe.map(appt => (
                      <AppointmentItem
                        key={appt._id}
                        appt={appt}
                        isSpecialistView={true}
                        updateStatus={updateAppointmentStatus}
                        statusColors={statusColors}
                      />
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-teal-800 mt-6 mb-3">
                  Appointments Booked <u>By Me</u>
                </h2>
                {bookedByMe.length === 0 ? (
                  <p className="text-gray-500 mb-4">You haven’t booked any appointments yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {bookedByMe.map(appt => (
                      <AppointmentItem
                        key={appt._id}
                        appt={appt}
                        isSpecialistView={false}
                        statusColors={statusColors}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}

        {/* Normal User View */}
        {!isSpecialist && (
          <>
            {bookedByMe.length === 0 ? (
              <p className="text-gray-500">You don't have any appointments yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {bookedByMe.map(appt => (
                  <AppointmentItem
                    key={appt._id}
                    appt={appt}
                    isSpecialistView={false}
                    statusColors={statusColors}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

};

export default Appointments;
