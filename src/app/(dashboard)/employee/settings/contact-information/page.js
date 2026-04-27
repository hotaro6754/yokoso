"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { User, Calendar, Phone, Mail, MapPin, Building, Save, CheckCircle2 } from "lucide-react";

export default function ContactInformationPage() {
  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Settings", href: "/employee/settings" },
    { label: "Contact Information", href: "/employee/settings/contact-information" },
  ];

  const [employee, setEmployee] = useState({
    firstName: "Vraj",
    lastName: "Darji",
    email: "vraj.darji@example.com",
    phone: "+91 9876543210",
    dob: "12 March 1998",
    gender: "Male",
    maritalStatus: "Single",
    bloodGroup: "O+",
    department: "Software Development",
    address: "123, Shreeji Apartment, Ahmedabad",
    country: "India",
    state: "Gujarat",
    city: "Ahmedabad",
    postalCode: "380015",
    emergencyContactName: "John Doe",
    emergencyContactPhone: "+91 9123456789",
  });

  const [message, setMessage] = useState("");

  const handleChange = (field, value) => {
    setEmployee((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can call API to save changes
    setMessage("Contact information has been updated successfully!");
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact & Personal Information</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update your personal, contact, and emergency information here
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="First Name" icon={<User className="w-4 h-4" />} value={employee.firstName} onChange={(v) => handleChange("firstName", v)} />
              <InputField label="Last Name" icon={<User className="w-4 h-4" />} value={employee.lastName} onChange={(v) => handleChange("lastName", v)} />
              <InputField label="Email" icon={<Mail className="w-4 h-4" />} type="email" value={employee.email} onChange={(v) => handleChange("email", v)} />
              <InputField label="Phone" icon={<Phone className="w-4 h-4" />} type="tel" value={employee.phone} onChange={(v) => handleChange("phone", v)} />
              <InputField label="Date of Birth" icon={<Calendar className="w-4 h-4" />} value={employee.dob} onChange={(v) => handleChange("dob", v)} />
              <InputField label="Gender" icon={<User className="w-4 h-4" />} value={employee.gender} onChange={(v) => handleChange("gender", v)} />
              <InputField label="Marital Status" icon={<User className="w-4 h-4" />} value={employee.maritalStatus} onChange={(v) => handleChange("maritalStatus", v)} />
              <InputField label="Blood Group" icon={<User className="w-4 h-4" />} value={employee.bloodGroup} onChange={(v) => handleChange("bloodGroup", v)} />
              <InputField label="Department" icon={<Building className="w-4 h-4" />} value={employee.department} onChange={(v) => handleChange("department", v)} />
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Address" icon={<MapPin className="w-4 h-4" />} value={employee.address} onChange={(v) => handleChange("address", v)} />
              <InputField label="Country" icon={<MapPin className="w-4 h-4" />} value={employee.country} onChange={(v) => handleChange("country", v)} />
              <InputField label="State" icon={<MapPin className="w-4 h-4" />} value={employee.state} onChange={(v) => handleChange("state", v)} />
              <InputField label="City" icon={<MapPin className="w-4 h-4" />} value={employee.city} onChange={(v) => handleChange("city", v)} />
              <InputField label="Postal Code" icon={<MapPin className="w-4 h-4" />} value={employee.postalCode} onChange={(v) => handleChange("postalCode", v)} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Emergency Contact Name" icon={<User className="w-4 h-4" />} value={employee.emergencyContactName} onChange={(v) => handleChange("emergencyContactName", v)} />
              <InputField label="Emergency Contact Phone" icon={<Phone className="w-4 h-4" />} type="tel" value={employee.emergencyContactPhone} onChange={(v) => handleChange("emergencyContactPhone", v)} />
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-300">{message}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, icon, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon}
        {label}
      </label>
      <input
        type={type}
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
