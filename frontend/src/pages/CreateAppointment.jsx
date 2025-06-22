import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePayment from "../components/StripePayment";
import { getSpecialistSchedule, getBookedAppointments, getAvailableTimeSlots, isWorkingDay, getDayIndex } from "../dashboard/Appointment/calendarUtils";
import { renderWorkingDaysCalendar, applyCalendarStyling, highlightWorkingDays } from "../dashboard/Appointment/WorkingDaysCalendar";
import { checkLoginStatus, filterSpecialistsByType, searchSpecialists } from "../dashboard/Appointment/authUtils";
import { useFetchSpecialists, useFetchSchedules } from "../dashboard/Appointment/apiHooks";
import { handleAppointmentChange, handleAppointmentSubmit } from "../dashboard/Appointment/formHandlers";
import Header from "./Header";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaSearch, FaClock, FaUserMd, FaClipboardList, FaRegCalendarCheck } from "react-icons/fa";
const stripePromise = loadStripe("pk_test_51REGk6LPejWsTmTS57FbFFRXJO8hOcu0PVbqIn0Wemc9dlNaMi9HuB24KRZAiRIgJTSFNnI7juFs7I2rwiHJcHVZ00yEoXp6bE"); 

function CreateAppointment({ onAppointmentCreated }) {
  const [specialists, setSpecialists] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    specialistId: "",
    appointmentDate: "",
    type: "select",
    notes: "",
    status: "pending",
    paymentType: "cash",
  });
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [workingDays, setWorkingDays] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const datePickerRef = useRef(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const selectRef = useRef(null);
  const navigate = useNavigate();

  // Check login status and user role
  useEffect(() => {
    checkLoginStatus(navigate, setCurrentUser, setFormData, setLoading);
  }, [navigate]);

  // Fetch specialists
  useFetchSpecialists(currentUser, setSpecialists, setErrorMessage);

  // Fetch schedules when specialists change
  useFetchSchedules(specialists, setSchedules, setLoadingSchedules, setErrorMessage);

  // Filter specialists by type
  useEffect(() => {
    if (specialists.length > 0) {
      const queryParams = new URLSearchParams(window.location.search);
      const specialistName = queryParams.get('specialist');
      
      if (specialistName) {
        const foundSpecialist = specialists.find(spec => 
          `${spec.name} ${spec.lastName}` === specialistName ||
          spec.name === specialistName
        );
        
        if (foundSpecialist) {
          setFormData(prev => ({
            ...prev,
            specialistId: foundSpecialist._id,
            type: getTypeFromRole(foundSpecialist.roleId?.name)
          }));
          
          // Filter specialists by the found specialist's type
          filterSpecialistsByType(
            getTypeFromRole(foundSpecialist.roleId?.name), 
            specialists, 
            setFilteredSpecialists
          );
        }
      }
    }
  }, [specialists]);

  const getTypeFromRole = (role) => {
    if (!role) return 'select';
    
    const roleMap = {
      'Fizioterapeut': 'therapy',
      'Nutricionist': 'nutrition',
      'Trajner': 'training',
      'Psikolog': 'mental_performance',

    };
    
    return roleMap[role] || 'select';
  };

  // Update working days when specialist changes
  useEffect(() => {
    if (formData.specialistId) {
      const schedule = getSpecialistSchedule(formData.specialistId, schedules);
      if (schedule && schedule.workDays) {
        setWorkingDays(schedule.workDays);
        applyCalendarStyling(schedule.workDays);
      } else {
        setWorkingDays([]);
      }
    } else {
      setWorkingDays([]);
    }
  }, [formData.specialistId, schedules]);

  const handleChange = (e) => handleAppointmentChange(
    e, 
    formData, 
    setFormData, 
    setErrorMessage, 
    workingDays, 
    specialists, 
    schedules, 
    setFilteredSpecialists
  );

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  // const handleSubmit = (e) => handleAppointmentSubmit(
  //   e, 
  //   formData, 
  //   specialists, 
  //   schedules, 
  //   setFormData, 
  //   setSuccessMessage, 
  //   setErrorMessage, 
  //   onAppointmentCreated
  // );

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Basic validation
  if (!formData.specialistId || !formData.appointmentDate || !formData.type) {
    setErrorMessage("Please fill all required fields");
    return;
  }

  // Additional validation for payment method
  if (!formData.paymentType) {
    setErrorMessage("Please select a payment method");
    return;
  }

  if (formData.paymentType === 'online') {
    // Show Stripe modal for online payment
    setShowStripeModal(true);
  } else {
    // For cash payment, directly create the appointment
    setLoading(true);
    try {
      await handleAppointmentSubmit(
        null, // no event
        formData,
        specialists,
        schedules,
        setFormData,
        setSuccessMessage,
        setErrorMessage,
        onAppointmentCreated
      );
      setShowConfirmationModal(true);
    } finally {
      setLoading(false);
    }
  }
};

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (formData.specialistId && formData.appointmentDate) {
        setLoadingSlots(true);
        try {
          const slots = await getAvailableTimeSlots(
            formData.specialistId, 
            formData.appointmentDate,
            schedules
          );
          setAvailableSlots(slots);
        } catch (error) {
          console.error("Error fetching available slots:", error);
          setErrorMessage("Error fetching available time slots");
        } finally {
          setLoadingSlots(false);
        }
      }
    };
  
    fetchAvailableSlots();
  }, [formData.specialistId, formData.appointmentDate, schedules]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    const filtered = searchSpecialists(value, formData.type, specialists);
    setFilteredSpecialists(filtered);
    if (filtered.length > 0 && selectRef.current) {
      selectRef.current.size = Math.min(filtered.length + 1, 6);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-100">
      <Header 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        className="relative z-10"  
      />
      
      {/* Navigation Buttons */}
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

      <div className="max-w-10xl mx-auto pt-32 pb-16 px-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with decorative element */}
          <div className="relative bg-gradient-to-r from-teal-600 to-cyan-500 py-12 px-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-xl"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold text-white mb-2">Create New Appointment</h2>
              <p className="text-teal-100 text-lg">Schedule your session with our health specialists</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Messages */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-3 text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-700 font-medium">{errorMessage}</p>
                  </div>
                  <button 
                    onClick={() => setErrorMessage('')}
                    className="text-red-700 hover:text-red-900 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-3 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-700 font-medium">{successMessage}</p>
                  </div>
                  <button 
                    onClick={() => setSuccessMessage('')}
                    className="text-green-700 hover:text-green-900 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <input type="hidden" name="userId" value={formData.userId} />
              
              {/* Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Appointment Type */}
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-medium text-gray-700 mb-1">
                      <FaClipboardList className="mr-2 text-teal-600" />
                      Appointment Type
                    </label>
                    <div className="relative">
                      <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleChange}
                        className="w-full p-3 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm text-gray-700 appearance-none"
                        required
                      >
                        <option value="select" disabled>Select Type</option>
                        <option value="training">Training</option>
                        <option value="nutrition">Nutrition</option>
                        <option value="therapy">Therapy</option>
                        <option value="mental_performance">Mental Performance</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-teal-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Specialist Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-medium text-gray-700 mb-1">
                      <FaUserMd className="mr-2 text-teal-600" />
                      Specialist
                    </label>
                    
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search specialists..."
                        onChange={handleSearch}
                        value={searchInput}
                        onFocus={() => {
                          if (selectRef.current) {
                            selectRef.current.size = Math.min(filteredSpecialists.length + 1, 6);
                          }
                        }}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
                        <FaSearch className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <select 
                        ref={selectRef}
                        name="specialistId" 
                        value={formData.specialistId} 
                        onChange={(e) => {
                          handleChange(e);
                          selectRef.current.size = 1;
                        }}
                        required
                        className="w-full p-3 pr-8 mt-1 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                        size={1}
                        onFocus={() => {
                          selectRef.current.size = Math.min(filteredSpecialists.length + 1, 6);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            if (document.activeElement !== document.querySelector('input[placeholder="Search specialists..."]')) {
                              selectRef.current.size = 1;
                            }
                          }, 200);
                        }}
                      >
                        <option value="">Select Specialist</option>
                        {filteredSpecialists.map((spec) => (
                          <option key={spec._id} value={spec._id}>
                            {spec.name} {spec.lastName} ({spec.roleId?.name})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-teal-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-medium text-gray-700 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Notes (Optional)
                    </label>
                    <textarea 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleChange} 
                      placeholder="Any special notes or requests" 
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm min-h-24"
                    />
                  </div>
                     {/* Specialist Schedule */}
                     {formData.specialistId && (
                    <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 shadow-sm">
                      <h4 className="font-semibold text-lg text-teal-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Specialist's Schedule
                      </h4>
                      {loadingSchedules ? (
                        <div className="flex justify-center items-center p-4">
                          <svg className="animate-spin h-6 w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : getSpecialistSchedule(formData.specialistId, schedules) ? (
                        <div className="space-y-4">
                          <div className="flex items-center p-3 bg-white/60 rounded-lg border border-teal-100">
                            <div className="flex-shrink-0 mr-3 text-teal-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-gray-900 font-medium">Working Days:</span>
                            <span className="ml-2 text-gray-700">{getSpecialistSchedule(formData.specialistId, schedules).workDays.join(', ')}</span>
                          </div>
                          
                          <div className="flex items-center p-3 bg-white/60 rounded-lg border border-teal-100">
                            <div className="flex-shrink-0 mr-3 text-teal-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-gray-900 font-medium">Working Hours:</span>
                            <span className="ml-2 text-gray-700">{formatTime(getSpecialistSchedule(formData.specialistId, schedules).startTime)} - {formatTime(getSpecialistSchedule(formData.specialistId, schedules).endTime)}</span>
                          </div>
                          
                          {getSpecialistSchedule(formData.specialistId, schedules).breakStartTime && (
                            <div className="flex items-center p-3 bg-white/60 rounded-lg border border-teal-100">
                              <div className="flex-shrink-0 mr-3 text-teal-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-gray-900 font-medium">Break Time:</span>
                              <span className="ml-2 text-gray-700">{formatTime(getSpecialistSchedule(formData.specialistId, schedules).breakStartTime)} - {formatTime(getSpecialistSchedule(formData.specialistId, schedules).breakEndTime)}</span>
                            </div>
                          )}

                          {getSpecialistSchedule(formData.specialistId, schedules).price && (
                      <div className="flex items-center p-3 bg-white/60 rounded-lg border border-teal-100">
                        <div className="flex-shrink-0 mr-3 text-teal-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2 0-2 4-4 4s-2-4-4-4 2 4 0 4 4 4 4 4 0-4 4-4 0-4 0-4z" />
                          </svg>
                        </div>
                        <span className="text-gray-900 font-medium">Price:</span>
                        <span className="ml-2 text-gray-700">€{parseFloat(getSpecialistSchedule(formData.specialistId, schedules).price).toFixed(2)}</span>
                      </div>
                    )}

                          
                          
                          {/* Calendar */}
                          {/* <div className="mt-4 bg-white rounded-lg border border-teal-100 p-4 shadow-sm">
                            {renderWorkingDaysCalendar(
                              workingDays, 
                              formData, 
                              'light', // Since we removed theme system
                              setFormData, 
                              datePickerRef, 
                              availableSlots, 
                              loadingSlots
                            )}
                          </div> */}
                        </div>
                      ) : (
                        <div className="p-4 bg-white/60 rounded-lg border border-teal-100 text-gray-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          No schedule information available
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  {/* Appointment Date & Time */}
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-medium text-gray-700 mb-1">
                      <FaRegCalendarCheck className="mr-2 text-teal-600" />
                      Appointment Date & Time
                    </label>
                   <div className="relative group">
                    <input
                      disabled
                      ref={datePickerRef}
                      type="datetime-local"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm bg-gray-50"
                      step="3600"
                      onFocus={(e) => {
                        const schedule = getSpecialistSchedule(formData.specialistId, schedules);
                        if (!schedule) return;

                        const now = new Date();
                        const [startHour, startMinute] = schedule.startTime.split(':');

                        const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
                        e.target.min = minDate.toISOString().slice(0, 16);

                        const [endHour, endMinute] = schedule.endTime.split(':');
                        const maxDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), endHour, endMinute);
                        e.target.max = maxDate.toISOString().slice(0, 16);

                        setTimeout(highlightWorkingDays, 100);
                      }}
                      onClick={() => {
                        setTimeout(highlightWorkingDays, 100);
                      }}
                      onInput={(e) => {
                        const selectedDate = new Date(e.target.value);
                        const schedule = getSpecialistSchedule(formData.specialistId, schedules);

                        if (!isWorkingDay(selectedDate, schedule)) {
                          setErrorMessage(`Specialist doesn't work on ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}`);
                          e.target.value = '';
                          setFormData(prev => ({ ...prev, appointmentDate: '' }));
                          return;
                        }
                      }}
                    />

                                  {/* Tooltip on hover */}
            <div className="absolute -top-10 left-0 bg-gray-800 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            Select a date in the calendar and an available slot
            </div>

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
              <FaClock className="h-5 w-5" />
            </div>
          </div>

                  </div>

                  <div className="mt-4 bg-white rounded-lg border border-teal-100 p-4 shadow-sm">
                            {renderWorkingDaysCalendar(
                              workingDays, 
                              formData, 
                              'light', // Since we removed theme system
                              setFormData, 
                              datePickerRef, 
                              availableSlots, 
                              loadingSlots
                            )}
                          </div>

                          {/* <button
                                type="button"
                                onClick={() => setShowStripeModal(true)}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl mt-4"
                              >
                               Pay Online with Stripe
                              </button> */}

                              {/* Payment Method */}
<div className="space-y-4">
  {/* Label with icon */}
  <div className="flex items-center text-gray-800">
    <div className="p-2 mr-2 bg-teal-100 rounded-lg">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 text-teal-600" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold">Payment Method</h3>
  </div>

  {/* Radio options */}
  <div className="grid grid-cols-2 gap-4">
    {/* Cash option */}
    <label 
      htmlFor="cash"
      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
        formData.paymentType === 'cash' 
          ? 'border-teal-500 bg-teal-50 shadow-md' 
          : 'border-gray-200 hover:border-teal-300'
      }`}
    >
      <div className="flex items-center">
        <div className="relative">
          <input
            id="cash"
            name="paymentType"
            type="radio"
            value="cash"
            checked={formData.paymentType === 'cash'}
            onChange={handleChange}
            className="absolute opacity-0"
          />
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            formData.paymentType === 'cash' 
              ? 'border-teal-600 bg-teal-600' 
              : 'border-gray-400'
          }`}>
            {formData.paymentType === 'cash' && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
        </div>
        <div className="ml-3">
          <span className="block font-medium text-gray-800">Pay Cash</span>
          <span className="block text-sm text-gray-500 mt-1">Pay in person at the clinic</span>
        </div>
      </div>
      <div className={`absolute top-3 right-3 p-1 rounded-full ${
        formData.paymentType === 'cash' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      </div>
    </label>

    {/* Online option */}
    <label 
      htmlFor="online"
      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
        formData.paymentType === 'online' 
          ? 'border-teal-500 bg-teal-50 shadow-md' 
          : 'border-gray-200 hover:border-teal-300'
      }`}
    >
      <div className="flex items-center">
        <div className="relative">
          <input
            id="online"
            name="paymentType"
            type="radio"
            value="online"
            checked={formData.paymentType === 'online'}
            onChange={handleChange}
            className="absolute opacity-0"
          />
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            formData.paymentType === 'online' 
              ? 'border-teal-600 bg-teal-600' 
              : 'border-gray-400'
          }`}>
            {formData.paymentType === 'online' && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
        </div>
        <div className="ml-3">
          <span className="block font-medium text-gray-800">Pay Online</span>
          <span className="block text-sm text-gray-500 mt-1">Secure payment with card</span>
        </div>
      </div>
      <div className={`absolute top-3 right-3 p-1 rounded-full ${
        formData.paymentType === 'online' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      </div>
    </label>
  </div>

  {/* Payment method details */}
  {formData.paymentType === 'online' && (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 animate-fadeIn">
      <p>You'll be redirected to secure payment after confirmation</p>
    </div>
  )}
</div>


                 

                
                </div>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-4 px-5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Create Appointment
                  </span>
                )}
              </button>
            </form>

{showStripeModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div className="relative bg-white rounded-2xl shadow-2xl border border-teal-100 w-full max-w-lg p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-800">Confirm and Pay</h3>
        </div>
        <button
          onClick={() => setShowStripeModal(false)}
          className="text-gray-400 hover:text-red-500 transition"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 bg-teal-50 border border-teal-100 rounded-xl p-4 shadow-inner">
        <p className="text-gray-800 text-lg font-semibold mb-2">Appointment Summary</p>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Specialist:</span>
            <span className="font-medium text-teal-700">
  {specialists.find(s => s._id === formData.specialistId)?.name + ' ' + 
   specialists.find(s => s._id === formData.specialistId)?.lastName || 'N/A'}
</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Date & Time:</span>
            <span className="font-medium text-teal-700">
              {new Date(formData.appointmentDate).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Amount:</span>
          <span className="font-medium text-teal-700">
            {(() => {
              const schedule = schedules.find(s => s.specialistId?._id === formData.specialistId);
              return schedule?.price ? `${parseFloat(schedule.price).toFixed(2)}€` : 'N/A';
            })()}
          </span>
          </div>
        </div>
      </div>

      {/* Stripe Form */}
      <Elements stripe={stripePromise}>
       <StripePayment
  appointmentData={formData}
  schedules={schedules} 
  onSuccess={() => {
    setShowStripeModal(false);
    handleAppointmentSubmit(
      null, // no event
      formData,
      specialists,
      schedules,
      setFormData,
      setSuccessMessage,
      setErrorMessage,
      onAppointmentCreated
    );
    setShowConfirmationModal(true);
  }}
/>
      </Elements>
    </div>
  </div>
)}

{showConfirmationModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full animate-fadeIn text-center">
      <div className="flex justify-center mb-4">
        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {formData.paymentType === 'online' ? 'Payment Successful!' : 'Appointment Confirmed!'}
      </h3>
      <p className="text-gray-600 mb-4">
        {formData.paymentType === 'online' 
          ? 'Your payment was processed and appointment has been confirmed.' 
          : 'Your appointment has been confirmed. Please bring cash for payment.'}
      </p>
      <button
        onClick={() => {
          setShowConfirmationModal(false);
          setSuccessMessage("Appointment created successfully!");
        }}
        className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
      >
        Close
      </button>
    </div>
  </div>
)}



          </div>
        </div>
      </div>
    </div>
  );
}
export default CreateAppointment;