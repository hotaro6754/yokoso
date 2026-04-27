"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

// Helper function to get user initials
const getUserInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };
  
  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-primary-600 dark:hover:bg-gray-700 lg:h-11 lg:w-11"
        onClick={handleClick}
      >
        <span
          className={`absolute right-1 top-1 z-10 h-2.5 w-2.5 rounded-full bg-accent-500 border-2 border-white dark:border-gray-800 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-accent-500 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-2 flex h-[480px] w-[340px] flex-col rounded-xl border border-gray-200 bg-white p-0 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[350px] lg:right-0"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {/* Example notification items */}
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-primary-50 dark:hover:bg-white/5"
            >
              <span className="relative flex-shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-primary-400">
                  {getUserInitials("Terry Franci")}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900"></span>
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Terry Franci</span>
                  <span className="text-gray-600 dark:text-gray-400"> requests permission to change </span>
                  <span className="font-medium">Project - Nganter App</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  5 min ago
                </p>
              </div>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-primary-50 dark:hover:bg-white/5"
            >
              <span className="relative flex-shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-primary-400">
                  {getUserInitials("Alena Franci")}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900"></span>
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Alena Franci</span>
                  <span className="text-gray-600 dark:text-gray-400"> requests permission to change </span>
                  <span className="font-medium">Project - Nganter App</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  8 min ago
                </p>
              </div>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-primary-50 dark:hover:bg-white/5"
              href="#"
            >
              <span className="relative flex-shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-primary-400">
                  {getUserInitials("Jocelyn Kenter")}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900"></span>
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Jocelyn Kenter</span>
                  <span className="text-gray-600 dark:text-gray-400"> requests permission to change </span>
                  <span className="font-medium">Project - Nganter App</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  15 min ago
                </p>
              </div>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-primary-50 dark:hover:bg-white/5"
              href="#"
            >
              <span className="relative flex-shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-primary-400">
                  {getUserInitials("Brandon Philips")}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-error-500 dark:border-gray-900"></span>
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Brandon Philips</span>
                  <span className="text-gray-600 dark:text-gray-400"> requests permission to change </span>
                  <span className="font-medium">Project - Nganter App</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  1 hr ago
                </p>
              </div>
            </DropdownItem>
          </li>

          {/* Add more items as needed */}
        </ul>
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
          <Link
            href="/"
            className="block w-full text-sm font-medium text-center text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View All Notifications
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}