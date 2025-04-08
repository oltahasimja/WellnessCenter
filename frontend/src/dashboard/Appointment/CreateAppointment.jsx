import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/ThemeContext";


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

          setFormData(prev => ({
            ...prev,
            userId: response.data.user.id
          }));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        navigate('/login');
      }
    };
    checkLoginStatus();
  }, [navigate]);

  // Fetch specialists
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const specsResponse = await axios.get("http://localhost:5000/api/user/specialists");
        setSpecialists(specsResponse.data);
      } catch (error) {
        console.error("Error fetching specialists:", error);
        setErrorMessage("Error fetching specialists data");
      }
    };

    if (currentUser) {
      fetchSpecialists();
    }
  }, [currentUser]);

const filterSpecialistsByType = (type) => {
  if (type === 'select') {
    setFilteredSpecialists([]);
    return;
  }
  
  let filtered = specialists;
  
  switch (type) {
    case 'training':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Trajner');
      break;
    case 'nutrition':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Nutricionist');
      break;
    case 'therapy':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Fizioterapeut');
      break;
    case 'mental_performance':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Psikolog');
      break;
    default:
      filtered = specialists;
  }
  
  setFilteredSpecialists(filtered);
};

  // Fetch schedules when specialists change
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const response = await axios.get("http://localhost:5000/api/schedule");
        setSchedules(response.data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setErrorMessage("Error fetching schedules");
      } finally {
        setLoadingSchedules(false);
      }
    };
    
    if (specialists.length > 0) {
      fetchSchedules();
    }
  }, [specialists]);

  // Filter specialists by type
  useEffect(() => {
    if (specialists.length > 0) {
      filterSpecialistsByType(formData.type);
    }
  }, [specialists, formData.type]);

  // Update working days when specialist changes
  useEffect(() => {
    if (formData.specialistId) {
      const schedule = getSpecialistSchedule(formData.specialistId);
      if (schedule && schedule.workDays) {
        setWorkingDays(schedule.workDays);
        
        // Add custom styling for available days
        applyCalendarStyling(schedule.workDays);
      } else {
        setWorkingDays([]);
      }
    } else {
      setWorkingDays([]);
    }
  }, [formData.specialistId, schedules]);

  // Function to apply styling to calendar days
  const applyCalendarStyling = (days) => {
    // First remove any existing style tag for calendar
    const existingStyle = document.getElementById('calendar-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    if (!days || days.length === 0) return;

    // Create styles for working days
    const daySelectors = days.map(day => {
      const dayIndex = getDayIndex(day);
      return `input[type="datetime-local"]::-webkit-calendar-picker-indicator[day="${dayIndex}"]`;
    }).join(', ');

    // Create style element
    const style = document.createElement('style');
    style.id = 'calendar-style';
    style.innerHTML = `
      /* Custom calendar styling for working days */
      .working-day {
        background-color: #4CAF50 !important;
        color: white !important;
        border-radius: 50% !important;
      }

      /* Highlight working days in calendar selector */
      .date-calendar td[data-day]:not([data-day=""]) {
        position: relative;
      }
      
      .date-calendar td[data-day].working-day:not([data-day=""]) {
        background-color: rgba(76, 175, 80, 0.2);
      }
    `;

    document.head.appendChild(style);

    // Apply working day class to calendar cells after render
    setTimeout(() => {
      highlightWorkingDays();
    }, 100);
  };

 

  

   // Function to highlight working days in calendar
   const highlightWorkingDays = () => {
    // Get the open calendar if available
    const calendar = document.querySelector('input[type="datetime-local"]:focus + .date-calendar');
    if (!calendar) return;

    const cells = calendar.querySelectorAll('td[data-day]:not([data-day=""])');
    cells.forEach(cell => {
      const date = new Date();
      date.setDate(parseInt(cell.getAttribute('data-day')));
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (workingDays.includes(dayName)) {
        cell.classList.add('working-day');
      } else {
        cell.classList.remove('working-day');
      }
    });
  };

  // Get day index (0 = Sunday, 1 = Monday, etc.)
  const getDayIndex = (dayName) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage('');
    
    if (name === 'appointmentDate') {
      const selectedDate = new Date(value);
      const now = new Date();
      
      if (selectedDate.toDateString() === now.toDateString() && 
          selectedDate.getHours() <= now.getHours()) {
        setErrorMessage('You cannot select a time slot in the past');
        return;
      }

      // Check if the day is a working day
      if (formData.specialistId) {
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        if (!workingDays.includes(dayName)) {
          setErrorMessage(`Specialist doesn't work on ${dayName}`);
          return;
        }
      }
    }
    
    setFormData({ ...formData, [name]: value });
  
    if (name === 'type') {
      filterSpecialistsByType(value);
      if (!filteredSpecialists.some(spec => spec._id === formData.specialistId)) {
        setFormData(prev => ({ ...prev, specialistId: '' }));
      }
    }

    // When specialist changes, reset appointment date to clear invalid selections
    if (name === 'specialistId') {
      setFormData(prev => ({ ...prev, appointmentDate: '' }));
    }
  };

  const getSpecialistSchedule = (specialistId) => {
    return schedules.find(schedule => 
      schedule.specialistId?._id === specialistId
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const selectedSpecialist = specialists.find(spec => 
        spec._id === formData.specialistId
      );
  
      if (!selectedSpecialist) {
        throw new Error('No specialist found with the selected ID');
      }
  
      const appointmentDateTime = new Date(formData.appointmentDate);
      const appointmentHour = appointmentDateTime.getHours();
  
      // Check if time slot is already booked
      const bookedAppointments = await getBookedAppointments(
        formData.specialistId, 
        formData.appointmentDate
      );
  
      const isTimeSlotTaken = bookedAppointments.some(appt => {
        const apptDate = new Date(appt.appointmentDate);
        const apptHour = apptDate.getHours();
        return appointmentHour === apptHour;
      });
  
      if (isTimeSlotTaken) {
        throw new Error('This time slot is already booked. Please choose another time.');
      }
  
      // Check if time is within working hours
      const specialistSchedule = getSpecialistSchedule(formData.specialistId);
      if (specialistSchedule) {
        const [startHour, startMinute] = specialistSchedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = specialistSchedule.endTime.split(':').map(Number);
        
        const appointmentMinute = appointmentDateTime.getMinutes();
        
        if (appointmentHour < startHour || 
            (appointmentHour === startHour && appointmentMinute < startMinute) ||
            appointmentHour > endHour ||
            (appointmentHour === endHour && appointmentMinute > endMinute)) {
          throw new Error(`Appointment time must be between ${specialistSchedule.startTime} and ${specialistSchedule.endTime}`);
        }
  
        // Check break time
        if (specialistSchedule.breakStartTime && specialistSchedule.breakEndTime) {
          const [breakStartHour, breakStartMinute] = specialistSchedule.breakStartTime.split(':').map(Number);
          const [breakEndHour, breakEndMinute] = specialistSchedule.breakEndTime.split(':').map(Number);
          
          if ((appointmentHour > breakStartHour || 
              (appointmentHour === breakStartHour && appointmentMinute >= breakStartMinute)) &&
              (appointmentHour < breakEndHour ||
              (appointmentHour === breakEndHour && appointmentMinute < breakEndMinute))) {
            throw new Error(`Cannot book during break time (${specialistSchedule.breakStartTime}-${specialistSchedule.breakEndTime})`);
          }
        }
      }
  
      const appointmentData = {
        ...formData,
        specialistId: selectedSpecialist._id,
        userId: parseInt(formData.userId, 10),
        appointmentDate: appointmentDateTime.toISOString(),
        status: 'pending'
      };
  
      await axios.post("http://localhost:5000/api/appointment", appointmentData);
      
      setFormData(prev => ({ 
        ...prev, 
        specialistId: "", 
        appointmentDate: "", 
        notes: "" 
      }));

      setSuccessMessage('Appointment created successfully!');
      
      // Notify parent component that appointment was created
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (formData.specialistId && formData.appointmentDate) {
        setLoadingSlots(true);
        try {
          const slots = await getAvailableTimeSlots(
            formData.specialistId, 
            formData.appointmentDate
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
  }, [formData.specialistId, formData.appointmentDate]);

  const getBookedAppointments = async (specialistId, selectedDate) => {
    try {
      const dateStr = new Date(selectedDate).toISOString().split('T')[0];
      
      const response = await axios.get(
        `http://localhost:5000/api/appointment`,
        {
          params: {
            specialistId: specialistId,
            date: dateStr,
            status: 'confirmed,pending'
          }
        }
      );
  
      const selectedDateObj = new Date(selectedDate);
      const selectedDateStart = new Date(selectedDateObj);
      selectedDateStart.setHours(0, 0, 0, 0);
      
      const selectedDateEnd = new Date(selectedDateObj);
      selectedDateEnd.setHours(23, 59, 59, 999);
  
      return response.data.filter(appt => {
        if (appt.status === 'canceled') return false;
        if (appt.specialistId?._id !== specialistId) return false;
        
        const apptDate = new Date(appt.appointmentDate);
        return apptDate >= selectedDateStart && apptDate <= selectedDateEnd;
      });
  
    } catch (error) {
      console.error("Error fetching booked appointments:", error);
      return [];
    }
  };

  const getAvailableTimeSlots = async (specialistId, selectedDate) => {
    if (!specialistId || !selectedDate) return [];
  
    const schedule = getSpecialistSchedule(specialistId);
    if (!schedule) return [];
  
    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();
  
    const bookedAppointments = await getBookedAppointments(specialistId, selectedDate);
  
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    
    const date = new Date(selectedDate);
    const availableSlots = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      if (schedule.breakStartTime && schedule.breakEndTime) {
        const [breakStartHour] = schedule.breakStartTime.split(':').map(Number);
        const [breakEndHour] = schedule.breakEndTime.split(':').map(Number);
        
        // Only skip if it's strictly within break time (not including end time)
        if (hour >= breakStartHour && hour < breakEndHour) {
          continue;
        }
      }
      
      if (isToday && hour <= now.getHours()) {
        continue;
      }
      
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      const isBooked = bookedAppointments.some(appt => {
        const apptDate = new Date(appt.appointmentDate);
        return apptDate.getHours() === hour;
      });
      
      if (!isBooked) {
        const localDateString = slotDate.toLocaleString('sv-SE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(' ', 'T');
    
        availableSlots.push({
          display: `${startTime} - ${endTime}`,
          isoString: localDateString
        });
      }
    }
    
    return availableSlots;
  };

  const isWorkingDay = (date, schedule) => {
    if (!schedule || !schedule.workDays) return false;
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return schedule.workDays.some(day => day.includes(dayName));
  };

  const renderWorkingDaysCalendar = () => {
    if (!workingDays || workingDays.length === 0) return null;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Create array of all days in month
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isAvailable = workingDays.includes(dayName);
      const isToday = date.getDate() === today.getDate() && 
                     date.getMonth() === today.getMonth();
      const isPast = date < today && !isToday;
      const isSelected = formData.appointmentDate && 
                        new Date(formData.appointmentDate).toDateString() === date.toDateString();
      
      days.push({
        date: date,
        day: i,
        dayName: dayName,
        isAvailable: isAvailable,
        isToday: isToday,
        isPast: isPast,
        isSelected: isSelected
      });
    }
    
    // Group days into weeks
    const weeks = [];
    let week = [];
    
    days.forEach((day, index) => {
      week.push(day);
      if (week.length === 7 || index === days.length - 1) {
        weeks.push(week);
        week = [];
      }
    });
  
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`font-semibold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {monthName} {currentYear}
          </h4>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Specialist's availability
            </span>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-lg overflow-hidden border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className={`grid grid-cols-7 divide-x divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-100'}`}>
            {weeks.map((week, weekIndex) => (
              week.map((day, dayIndex) => (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-[60px] p-1 ${!day ? (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50') : ''} ${
                    day?.isSelected ? (theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50') : ''
                  }`}
                >
                  {day && (
                    <button
                      type="button"
                      onClick={() => {
                        if (day.isAvailable && !day.isPast) {
                          const date = new Date(day.date);
                          // Adjust for timezone offset to prevent date shifting
                          const timezoneOffset = date.getTimezoneOffset() * 60000;
                          const adjustedDate = new Date(date.getTime() - timezoneOffset);
                          const dateStr = adjustedDate.toISOString().slice(0, 16);
                          
                          setFormData(prev => ({
                            ...prev,
                            appointmentDate: dateStr
                          }));
                          
                          if (datePickerRef.current) {
                            datePickerRef.current.focus();
                          }
                        }
                      }}
                      className={`
                        w-full h-full flex flex-col items-center justify-center rounded-lg
                        relative overflow-hidden
                        ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                        ${day.isPast ? (theme === 'dark' ? 'text-gray-500' : 'text-gray-400') : ''}
                        ${day.isAvailable && !day.isPast ? 
                          (theme === 'dark' ? 'hover:bg-green-900/30 cursor-pointer' : 'hover:bg-green-50 cursor-pointer') : 
                          'cursor-not-allowed'
                        }
                        ${day.isSelected ? (theme === 'dark' ? 'bg-blue-800/30' : 'bg-blue-100') : ''}
                        transition-all duration-200
                      `}
                      disabled={!day.isAvailable || day.isPast}
                    >
                      {/* Day number */}
                      <span className={`
                        z-10 text-sm font-medium
                        ${day.isSelected ? (theme === 'dark' ? 'text-blue-300 font-bold' : 'text-blue-700 font-bold') : ''}
                        ${!day.isAvailable || day.isPast ? 
                          (theme === 'dark' ? 'text-gray-500' : 'text-gray-400') : 
                          (theme === 'dark' ? 'text-gray-200' : 'text-gray-700')
                        }
                      `}>
                        {day.day}
                      </span>
                      
                      {/* Availability indicator */}
                      {day.isAvailable && !day.isPast && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      )}
                      
                      {/* Selected day indicator */}
                      {day.isSelected && (
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'} opacity-50`}></div>
                      )}
                      
                      {/* Today's date indicator */}
                      {day.isToday && !day.isSelected && (
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} opacity-30`}></div>
                      )}
                    </button>
                  )}
                </div>
              ))
            ))}
          </div>
        </div>
        
        {/* Time Slots Section */}
        {formData.appointmentDate && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-semibold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Available Time Slots
              </h4>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`}></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {availableSlots.map((slot, index) => {
                  const isSelected = formData.appointmentDate === slot.isoString;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`
                        py-3 px-4 rounded-lg text-center relative
                        overflow-hidden transition-all duration-200
                        ${isSelected ? 
                          'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' : 
                          (theme === 'dark' ? 
                            'bg-gray-700 text-blue-300 hover:bg-gray-600 border border-gray-600' : 
                            'bg-white text-blue-800 hover:bg-blue-50 border border-gray-200')
                        }
                        transform ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                      `}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          appointmentDate: slot.isoString
                        }));
                      }}
                    >
                      <span className="relative z-10 font-medium">
                        {slot.display}
                      </span>
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600 opacity-10"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h5 className={`mt-2 text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  No available slots
                </h5>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This specialist has no availability on this day
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const selectRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Ruaj vlerën e input-it në state
    
    const searchTerm = value.toLowerCase();
    
    let filtered = specialists;
    
    switch (formData.type) {
      case 'training':
        filtered = specialists.filter(spec => spec.roleId?.name === 'Trajner');
        break;
      case 'nutrition':
        filtered = specialists.filter(spec => spec.roleId?.name === 'Nutricionist');
        break;
      case 'therapy':
        filtered = specialists.filter(spec => spec.roleId?.name === 'Fizioterapeut');
        break;
      case 'mental_performance':
        filtered = specialists.filter(spec => spec.roleId?.name === 'Psikolog');
        break;
      default:
        filtered = specialists;
    }
    
    filtered = filtered.filter(spec => 
      `${spec.name} ${spec.lastName} ${spec.roleId?.name}`
        .toLowerCase()
        .includes(searchTerm)
    );
    
    setFilteredSpecialists(filtered);
    
    // Hap dropdown-in nëse ka rezultate
    if (filtered.length > 0 && selectRef.current) {
      selectRef.current.size = Math.min(filtered.length + 1, 6);
    }
  };
  

  const statusColors = {
    pending: theme === 'dark' ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800",
    confirmed: theme === 'dark' ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800",
    canceled: theme === 'dark' ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800",
    completed: theme === 'dark' ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
  };



  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 shadow-xl' : 'bg-white shadow-md'}`}>
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
  value={searchInput} // Kjo është shumë e rëndësishme
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
      // Kontrollo nëse fokusi është zhvendosur në inputin e kërkimit
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
              ) : getSpecialistSchedule(formData.specialistId) ? (
                <div className="space-y-3">
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Working Days:</strong> {getSpecialistSchedule(formData.specialistId).workDays.join(', ')}
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Working Hours:</strong> {formatTime(getSpecialistSchedule(formData.specialistId).startTime)} - {formatTime(getSpecialistSchedule(formData.specialistId).endTime)}
                  </p>
                  {getSpecialistSchedule(formData.specialistId).breakStartTime && (
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      <strong className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Break Time:</strong> {formatTime(getSpecialistSchedule(formData.specialistId).breakStartTime)} - {formatTime(getSpecialistSchedule(formData.specialistId).breakEndTime)}
                    </p>
                  )}
                  
                  {/* Display working days calendar */}
                  {renderWorkingDaysCalendar()}
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
                  const schedule = getSpecialistSchedule(formData.specialistId);
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
                  const schedule = getSpecialistSchedule(formData.specialistId);
                  
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