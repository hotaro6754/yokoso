"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

const ActionDropdown = ({ 
  itemId, 
  viewUrl, 
  editUrl, 
  onDelete,
  customActions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 192, // 192px = w-48
      });
    }
    setIsOpen(!isOpen);
  };

  const handleAction = (callback) => {
    if (callback) {
      callback();
    }
    setIsOpen(false);
  };

  const actions = [];
  
  if (viewUrl) {
    actions.push({
      label: "View",
      icon: Eye,
      href: viewUrl,
      className: "text-gray-700 dark:text-gray-300"
    });
  }

  if (editUrl) {
    actions.push({
      label: "Edit",
      icon: Edit,
      href: editUrl,
      className: "text-gray-700 dark:text-gray-300"
    });
  }

  if (onDelete) {
    actions.push({
      label: "Delete",
      icon: Trash2,
      onClick: () => handleAction(onDelete),
      className: "text-red-600 dark:text-red-400"
    });
  }

  // Add custom actions
  actions.push(...customActions);

  if (actions.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 rounded transition-colors"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu - Fixed position to avoid overflow clipping */}
          <div
            ref={dropdownRef}
            className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              
              if (action.href) {
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${action.className || ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </Link>
                );
              }
              
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex items-center gap-3 px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${action.className || ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ActionDropdown;
