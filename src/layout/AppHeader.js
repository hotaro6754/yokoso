"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import React from "react";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full glass-premium border-b border-gray-200 dark:border-white/10 dark:bg-[#0A0A0A]/80">
      <div className="flex h-full w-full items-center justify-between gap-3 px-4 sm:gap-4 lg:px-6">
        
        {/* Left: Menu Toggle */}
        <button
          className={`lg:hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:scale-105 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white ${isMobileOpen ? 'hidden' : 'flex'
            }`}
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.5 4.5C2.5 4.22386 2.72386 4 3 4H17C17.2761 4 17.5 4.22386 17.5 4.5C17.5 4.77614 17.2761 5 17 5H3C2.72386 5 2.5 4.77614 2.5 4.5ZM2.5 10C2.5 9.72386 2.72386 9.5 3 9.5H17C17.2761 9.5 17.5 9.72386 17.5 10C17.5 10.2761 17.2761 10.5 17 10.5H3C2.72386 10.5 2.5 10.2761 2.5 10ZM2.5 15.5C2.5 15.2239 2.72386 15 3 15H17C17.2761 15 17.5 15.2239 17.5 15.5C17.5 15.7761 17.2761 16 17 16H3C2.72386 16 2.5 15.7761 2.5 15.5Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

        {/* Right: Theme, Notifications, Profile */}
        <div className="ml-auto flex items-center justify-end gap-3 2xsm:gap-4">
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
