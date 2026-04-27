"use client";

import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Calendar } from "lucide-react";

const pad2 = (n) => String(n).padStart(2, "0");
const toYmdLocal = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export default function DatePicker({
  name,
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  required = false,
  minDate = null,
  maxDate = null,
  disabled = false,
  className = "",
  dateFormat = "d-m-Y", // display format
}) {
  const handleDateChange = (dates) => {
    if (onChange && dates && dates.length > 0) {
      const date = dates[0];
      const event = {
        target: {
          name,
          // IMPORTANT: store in local YYYY-MM-DD (avoid timezone shifts)
          value: date ? toYmdLocal(date) : "",
        },
      };
      onChange(event);
    } else if (onChange) {
      const event = {
        target: {
          name,
          value: "",
        },
      };
      onChange(event);
    }
  };

  const inputClass = `w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className} ${
    disabled ? "opacity-60 cursor-not-allowed" : ""
  }`;

  const flatpickrOptions = {
    // Store as Y-m-d to match our form state/API,
    // but show as dateFormat (default d-m-Y) to the user.
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: dateFormat,
    altInputClass: inputClass,
    allowInput: true,
    clickOpens: !disabled,
    disable: disabled ? [true] : [],
    minDate: minDate,
    maxDate: maxDate,
    static: false,
  };

  return (
    <div className="relative">
      <Flatpickr
        value={value || ""}
        onChange={handleDateChange}
        options={flatpickrOptions}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
      <Calendar
        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
        size={20}
      />
    </div>
  );
}
