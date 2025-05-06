import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getSpecialistSchedule, getBookedAppointments, getAvailableTimeSlots, isWorkingDay, getDayIndex } from "../dashboard/Appointment/calendarUtils";
import { renderWorkingDaysCalendar, applyCalendarStyling, highlightWorkingDays } from "../dashboard/Appointment/WorkingDaysCalendar";
import { checkLoginStatus, filterSpecialistsByType, searchSpecialists } from "../dashboard/Appointment/authUtils";
import { useFetchSpecialists, useFetchSchedules } from "../dashboard/Appointment/apiHooks";
import { handleAppointmentChange, handleAppointmentSubmit } from "../dashboard/Appointment/formHandlers";
import Header from "./Header";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";


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
    status: "pending"
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
      filterSpecialistsByType(formData.type, specialists, setFilteredSpecialists);
    }
  }, [specialists, formData.type]);

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

  const handleSubmit = (e) => handleAppointmentSubmit(
    e, 
    formData, 
    specialists, 
    schedules, 
    setFormData, 
    setSuccessMessage, 
    setErrorMessage, 
    onAppointmentCreated
  );

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
    <div className="min-h-screen p-6 bg-gradient-to-br from-teal-50 to-blue-50">
<Header 
  currentUser={currentUser} 
  setCurrentUser={setCurrentUser} 
  className="relative z-10"  
/>
       {/* Butonat e Navigimit në Header */}
       <div className="fixed top-5 left-5 z-50 flex space-x-4">
  <div 
    onClick={() => navigate('/')}
    className="flex items-center space-x-2 text-teal-600 hover:text-teal-800 transition-colors duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md cursor-pointer"
  >
    <FaArrowLeft className="text-lg" />
    <span className="font-medium">Back to Home</span>
  </div>
  
  <div 
    onClick={() => navigate('/myappointments')}
    className="flex items-center space-x-2 text-teal-600 hover:text-teal-800 transition-colors duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md cursor-pointer"
  >
    <FaCalendarAlt className="text-lg" />
    <span className="font-medium">My Appointments</span>
  </div>
</div>

       
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-[6rem]">

    

        
        <div className="mb-8 text-center mt-[1rem]">
          <h2 className="text-3xl font-bold text-teal-700 mb-2">Create New Appointment</h2>
          <p className="text-gray-600">Schedule your session with our specialists</p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-red-700">{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage('')}
                className="text-red-700 hover:text-red-900"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-green-700">{successMessage}</p>
              <button 
                onClick={() => setSuccessMessage('')}
                className="text-green-700 hover:text-green-900"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="userId" value={formData.userId} />
          
          {/* Appointment Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Appointment Type
            </label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            >
              <option value="select" disabled>Select Type</option>
              <option value="training">Training</option>
              <option value="nutrition">Nutrition</option>
              <option value="therapy">Therapy</option>
              <option value="mental_performance">Mental Performance</option>
            </select>
          </div>
          
          {/* Specialist Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
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
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
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
                className="w-full p-3 pr-8 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Specialist Schedule */}
          {formData.specialistId && (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg text-teal-700 mb-4">
                Specialist's Schedule
              </h4>
              {loadingSchedules ? (
                <p className="text-gray-600">Loading schedule...</p>
              ) : getSpecialistSchedule(formData.specialistId, schedules) ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Working Days:</strong> {getSpecialistSchedule(formData.specialistId, schedules).workDays.join(', ')}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Working Hours:</strong> {formatTime(getSpecialistSchedule(formData.specialistId, schedules).startTime)} - {formatTime(getSpecialistSchedule(formData.specialistId, schedules).endTime)}
                  </p>
                  {getSpecialistSchedule(formData.specialistId, schedules).breakStartTime && (
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Break Time:</strong> {formatTime(getSpecialistSchedule(formData.specialistId, schedules).breakStartTime)} - {formatTime(getSpecialistSchedule(formData.specialistId, schedules).breakEndTime)}
                    </p>
                  )}
                  
                  {/* Calendar */}
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
              ) : (
                <p className="text-gray-600">No schedule information available</p>
              )}
            </div>
          )}

          {/* Appointment Date & Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Appointment Date & Time
            </label>
            <div className="relative">
              <input
                disabled 
                ref={datePickerRef}
                type="datetime-local" 
                name="appointmentDate" 
                value={formData.appointmentDate} 
                onChange={handleChange} 
                required 
                min={new Date().toISOString().slice(0, 16)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <input 
              type="text" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Any special notes or requests" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Create Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAppointment;