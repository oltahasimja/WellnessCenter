import React from "react";
import ThemeSwitcher from "../components/ThemeSwitcher"; 

function Navbar({ setTheme }) {
  return (
    <nav className="flex items-center justify-end px-3 rounded-md py-2 bg-white shadow-md dark:bg-gray-900 w-[13rem] fixed top-0 right-0 mt-4 mr-4 z-50">
      {/* Seksioni i kërkimit */}
      <div className="flex items-center">
        {/* You can add a search section here if needed */}
      </div>

      {/* Seksioni i ikonave dhe switcher-it të temave */}
      <div className="flex items-center space-x-4">
        {/* Ikona për njoftime */}
        <button
          className="p-2 rounded bg-gray-200 dark:bg-gray-800 dark:text-white"
          aria-label="Notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* Foto e profilit */}
        <img
          src="https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid"
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />

        {/* Switcher për Dark Mode / Light Mode */}
        <ThemeSwitcher />
      </div>
    </nav>
  );
}

export default Navbar;
