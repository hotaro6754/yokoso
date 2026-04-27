"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import Label from '@/components/form/Label';

export default function CustomSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  icon,
  placeholder = "Select an option",
  searchable = false,
  className = '',
  disabled = false,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuPos, setMenuPos] = useState(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

  // Recalculate position when opening
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownMaxHeight = 320;

    if (spaceBelow < dropdownMaxHeight + 10 && rect.top > dropdownMaxHeight) {
      setMenuPos({
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
        isFlipped: true
      });
    } else {
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        isFlipped: false
      });
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // Check if click is inside the dropdown portal or the button
      if (
        dropdownRef.current && dropdownRef.current.contains(event.target)
      ) {
        return; // Click inside dropdown, don't close
      }
      if (
        buttonRef.current && buttonRef.current.contains(event.target)
      ) {
        return; // Click on button, let onClick handler deal with it
      }
      setIsOpen(false);
      setSearchQuery('');
    };

    // Use a timeout so the listener isn't attached in the same tick as the click
    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen]);

  // Close on resize (window resize only, not scroll)
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setIsOpen(false);
      setSearchQuery('');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable 
    ? (options || []).filter(option => (option.label || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : (options || []);

  const selectedOption = (options || []).find(option => option.value === value);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Render the dropdown menu via a portal to avoid any parent overflow/scroll issues
  const renderDropdownMenu = () => {
    if (!isOpen || !menuPos) return null;

    const menu = (
      <div 
        ref={dropdownRef}
        style={{ 
          position: 'fixed',
          top: menuPos.top ? `${menuPos.top}px` : 'auto',
          bottom: menuPos.bottom ? `${menuPos.bottom}px` : 'auto', 
          left: `${menuPos.left}px`, 
          width: `${menuPos.width}px`,
          zIndex: 99999,
        }}
        className={`
          bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 
          rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col max-h-[320px] overflow-hidden 
          animate-in fade-in slide-in-from-top-2 duration-300
        `}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {searchable && (
          <div className="p-3 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-gray-900/10 dark:text-white dark:placeholder-gray-500 outline-none"
                placeholder="Search options..."
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
        <div className="py-2 overflow-y-auto custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value);
                }}
                className={`
                  w-full px-5 py-3 text-left flex items-center justify-between text-sm transition-all duration-200
                  hover:bg-indigo-50/50 dark:hover:bg-gray-800/50
                  ${value === option.value 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold' 
                    : 'text-gray-600 dark:text-gray-300'
                  }
                `}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 ml-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            ))
          ) : (
            <div className="px-5 py-8 text-xs text-center text-gray-400 italic">
              No matching results
            </div>
          )}
        </div>
      </div>
    );

    // Use portal to render at document body level, avoiding any parent overflow/scroll issues
    if (typeof document !== 'undefined') {
      return createPortal(menu, document.body);
    }
    return null;
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <Label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
      )}
      
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onMouseDown={handleToggle}
          className={`
            w-full px-5 py-3 border-2 rounded-[24px] text-left transition-all duration-300
            flex items-center justify-between shadow-sm group
            ${isOpen ? 'border-gray-900 ring-4 ring-gray-900/5 dark:border-white' : 'border-gray-100 dark:border-gray-800'}
            ${error ? 'border-red-500 ring-4 ring-red-500/10' : ''}
            ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'}
            ${className}
          `}
        >
          <div className="flex items-center min-w-0">
            {icon && <span className="mr-3 text-gray-400">{icon}</span>}
            <span className={`truncate text-sm font-medium ${!selectedOption ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-gray-900 dark:text-white' : ''}`} 
          />
        </button>

        {renderDropdownMenu()}
      </div>
      
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1.5 px-1 font-medium italic">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}