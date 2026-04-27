// src/components/form/input/DatePickerField.js
"use client";

import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/light.css";
import { Calendar } from "lucide-react";

/**
 * Enhanced DatePickerField
 * Uses the high-end styling from the Leave module for project-wide consistency.
 */
const DatePickerField = ({
  id,
  name,
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  className = "",
  min,
  max,
  disabled = false,
  error = false,
  options = {},
}) => {
  const safeOptions = (() => {
    const base = options && typeof options === "object" ? { ...options } : {};
    if (Object.prototype.hasOwnProperty.call(base, "appendTo")) {
      if (!base.appendTo || base.appendTo.nodeType !== 1) {
        delete base.appendTo;
      }
    }
    return base;
  })();
  const inputClass = `w-full px-4 py-2.5 pr-10 text-sm border rounded-xl outline-none transition-all duration-200 ${error
      ? "bg-red-50 border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/10 dark:border-red-900/50 dark:text-red-400"
      : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    } ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`;

  return (
    <>
      <style jsx global>{`
        .flatpickr-calendar {
          z-index: 99999 !important;
        }
        .flatpickr-calendar.open {
          z-index: 99999 !important;
        }
      `}</style>
      <div className="relative group">
      <Flatpickr
        id={id}
        name={name}
        value={value || ""}
        onChange={(dates, dateStr) => {
          onChange?.(dateStr);
        }}
        options={{
          dateFormat: "Y-m-d",
          altInput: true,
          altFormat: "d-m-Y",
          altInputClass: inputClass,
          allowInput: true,
          clickOpens: !disabled,
          disableMobile: false,
          minDate: min || null,
          maxDate: max || null,
          static: false,
          animate: true,
          position: "auto",
          shorthandCurrentMonth: true,
          showMonths: 1,
          ...safeOptions,
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClass}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Calendar
          className={`w-4 h-4 transition-colors ${error ? "text-red-400" : "text-gray-400 group-hover:text-[hsl(var(--primary))]"}`}
        />
      </div>

      {error && typeof error === 'string' && (
        <p className="mt-1.5 text-[10px] font-bold uppercase text-red-600 tracking-wider flex items-center gap-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
    </>
  );
};

export default DatePickerField;
