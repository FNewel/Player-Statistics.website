'use client';

import React, { useState, useEffect } from 'react';

const AppearanceSwitch = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Get saved preference from localStorage or fallback to system setting
        const savedPreference = localStorage.getItem('darkMode');
        const darkModeEnabled = savedPreference !== null
            ? savedPreference === 'true'
            : systemPrefersDark;

        setIsDarkMode(darkModeEnabled);

        // Apply the correct class to <html>
        document.documentElement.classList.toggle('dark', darkModeEnabled);
    }, []);

    const toggleMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        // Update the <html> element
        document.documentElement.classList.toggle('dark', newMode);

        // Save preference to localStorage
        localStorage.setItem('darkMode', newMode);
    };

    return (
        <button
            onClick={toggleMode}
            className="p-1 rounded-md flex items-center justify-center relative w-10 h-10"
        >
            {/* Moon Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`absolute transition-transform duration-300 ease-in-out ${isDarkMode ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'}`}
            >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>

            {/* Sun Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-white absolute transition-transform duration-300 ease-in-out ${isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-180'}`}
            >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
            </svg>
        </button>
    );
};

export default AppearanceSwitch;
