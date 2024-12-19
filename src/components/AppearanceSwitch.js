'use client';

import React, { useState, useEffect } from 'react';

const AppearanceSwitch = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedMode);

        // Set initial body class without overwriting existing ones
        document.body.classList.add(savedMode ? 'dark-mode' : 'light-mode');
    }, []);

    const toggleMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        // Update body classes safely
        document.body.classList.remove(newMode ? 'light-mode' : 'dark-mode');
        document.body.classList.add(newMode ? 'dark-mode' : 'light-mode');

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
                className={`absolute transition-transform duration-300 ease-in-out ${isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-180'
                    }`}
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
                className={`absolute transition-transform duration-300 ease-in-out ${isDarkMode ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'
                    }`}
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
