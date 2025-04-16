import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/ThemeContext";
import { getSpecialistSchedule, getBookedAppointments, getAvailableTimeSlots, isWorkingDay, getDayIndex } from "./calendarUtils";
import { renderWorkingDaysCalendar, applyCalendarStyling, highlightWorkingDays } from "./WorkingDaysCalendar";
import { checkLoginStatus, filterSpecialistsByType, searchSpecialists } from "./authUtils";
import { useFetchSpecialists, useFetchSchedules } from "./apiHooks";
import { handleAppointmentChange, handleAppointmentSubmit } from "./formHandlers";



function CreateAppointment({ onAppointmentCreated }) {
  const { theme } = useTheme();

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
        
        // Using the imported function from WorkingDaysCalendar
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

  const selectRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Use the imported search function
    const filtered = searchSpecialists(value, formData.type, specialists);
    setFilteredSpecialists(filtered);
    
    // Open dropdown if there are results
    if (filtered.length > 0 && selectRef.current) {
      selectRef.current.size = Math.min(filtered.length + 1, 6);
    }
  };


  // Component rendering remains the same...
  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 shadow-xl' : 'bg-white shadow-md'}`}>
        {/* Component JSX remains unchanged */}
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Create New Appointment
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="hidden" 
            name="userId" 
            value={formData.userId} 
          />
          
          <div>
            <label className={`block mb-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Appointment Type
            </label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:ring-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500'}`}
              required
            >
              <option value="select" disabled>Select Type</option>
              <option value="training">Training</option>
              <option value="nutrition">Nutrition</option>
              <option value="therapy">Therapy</option>
              <option value="mental_performance">Mental Performance</option>
            </select>
          </div>
          
          <div className="relative mb-4">
            <label className={`block mb-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-white' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900'
                }`}
              />
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
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
                className={`w-full p-3 pr-8 mt-1 border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900'
                }`}
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
                  <option 
                    key={spec._id} 
                    value={spec._id}
                    className={theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'}
                  >
                    {spec.name} {spec.lastName} ({spec.roleId?.name})
                  </option>
                ))}
              </select>
              <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {formData.specialistId && (
            <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
              <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Specialist's Schedule
              </h4>
              {loadingSchedules ? (
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading schedule...</p>
              ) : getSpecialistSchedule(formData.specialistId, schedules) ? (
                <div className="space-y-3">
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Working Days:</strong> {getSpecialistSchedule(formData.specialistId, schedules).workDays.join(', ')}
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Working Hours:</strong> {formatTime(getSpecialistSchedule(formData.specialistId, schedules).startTime)} - {formatTime(getSpecialistSchedule(formData.specialistId, schedules).endTime)}
                  </p>
                  {getSpecialistSchedule(formData.specialistId, schedules).breakStartTime && (
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <strong className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Break Time:</strong> {formatTime(getSpecialistSchedule(formData.specialistId, schedules).breakStartTime)} - {formatTime(getSpecialistSchedule(formData.specialistId, schedules).breakEndTime)}
                    </p>
                  )}
                  
                  {/* Display working days calendar */}
                  {renderWorkingDaysCalendar(
                    workingDays, 
                    formData, 
                    theme, 
                    setFormData, 
                    datePickerRef, 
                    availableSlots, 
                    loadingSlots
                  )}
                </div>
              ) : (
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No schedule information available</p>
              )}
            </div>
          )}

          <div>
            <label className={`block mb-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:ring-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500'}`}
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

          <div>
            <label className={`block mb-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes (Optional)
            </label>
            <input 
              type="text" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Any special notes or requests" 
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:ring-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500'}`}
            />
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
          >
            {loading ? 'Creating...' : 'Create Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAppointment;