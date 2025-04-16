// WorkingDaysCalendar.js
import React from 'react';
import { getDayIndex } from './calendarUtils';

// Function to apply styling to calendar days
export const applyCalendarStyling = (days) => {
  // First remove any existing style tag for calendar
  const existingStyle = document.getElementById('calendar-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  if (!days || days.length === 0) return;

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
    highlightWorkingDays(days);
  }, 100);
};

// Function to highlight working days in calendar
export const highlightWorkingDays = (workingDays) => {
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

export const renderWorkingDaysCalendar = (workingDays, formData, theme, setFormData, datePickerRef, availableSlots, loadingSlots) => {
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