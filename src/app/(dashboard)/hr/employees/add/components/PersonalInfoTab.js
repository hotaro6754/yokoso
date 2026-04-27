// src/components/employee/PersonalInfoTab.js
"use client";

import React, { useState } from "react";
import DatePickerField from "@/components/form/input/DatePickerField";
import AvatarUpload from "./AvatarUpload";

export default function PersonalInfoTab({ initial = {}, onNext }) {
  // local form state
  const [form, setForm] = useState({
    firstName: initial.firstName || "",
    middleName: initial.middleName || "",
    lastName: initial.lastName || "",
    employeeId: initial.employeeId || "",
    dob: initial.dob || "",
    gender: initial.gender || "",
    email: initial.email || "",
    personalEmail: initial.personalEmail || "",
    mobile: initial.mobile || "",
    altMobile: initial.altMobile || "",
    address: initial.address || "",
    emergencyName: initial.emergencyName || "",
    emergencyRelation: initial.emergencyRelation || "",
    emergencyPhone: initial.emergencyPhone || "",
    nationalId: initial.nationalId || "",
    avatar: initial.avatar || null, // { file, url } or null
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function setField(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim() && !form.personalEmail.trim()) e.email = "At least one email required";
    if (!form.mobile.trim()) e.mobile = "Mobile is required";
    // simple email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) e.email = "Enter a valid work email";
    if (form.personalEmail && !emailRegex.test(form.personalEmail)) e.personalEmail = "Enter a valid personal email";
    // emergency phone
    if (form.emergencyPhone && form.emergencyPhone.length < 6) e.emergencyPhone = "Enter valid emergency phone";
    return e;
  }

  async function handleNext(e) {
    e?.preventDefault();
    const eobj = validate();
    if (Object.keys(eobj).length) {
      setErrors(eobj);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    // For now we pass data back to parent via onNext
    // If you want, you can upload avatar file here and get URL before next step.
    const payload = { ...form };
    try {
      // simulate slight delay (replace with real API if needed)
      await new Promise((res) => setTimeout(res, 400));
      onNext?.(payload);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6 p-6" onSubmit={handleNext}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <AvatarUpload
            value={form.avatar}
            onChange={(v) => setField("avatar", v)}
          />
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name *</label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded shadow-sm text-sm focus:outline-none focus:ring-1 ${
                  errors.firstName ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"
                }`}
                placeholder="First name"
              />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Middle Name</label>
              <input
                value={form.middleName}
                onChange={(e) => setField("middleName", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="Middle name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Last Name *</label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded shadow-sm text-sm focus:outline-none focus:ring-1 ${
                  errors.lastName ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"
                }`}
                placeholder="Last name"
              />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Employee ID</label>
              <div className="flex gap-2">
                <input
                  value={form.employeeId}
                  onChange={(e) => setField("employeeId", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                  placeholder="Auto or manual"
                />
                <button
                  type="button"
                  onClick={() => setField("employeeId", `EMP-${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="mt-1 inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded text-sm hover:bg-gray-100"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <DatePickerField
                value={form.dob}
                onChange={(value) => setField("dob", value)}
                placeholder="YYYY-MM-DD"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Work Email</label>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.email ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"
                }`}
                placeholder="name@company.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Personal Email</label>
              <input
                value={form.personalEmail}
                onChange={(e) => setField("personalEmail", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="personal@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Mobile *</label>
              <input
                value={form.mobile}
                onChange={(e) => setField("mobile", e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.mobile ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"
                }`}
                placeholder="+91-98765-43210"
              />
              {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Alternate Mobile</label>
              <input
                value={form.altMobile}
                onChange={(e) => setField("altMobile", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="Alternate phone"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">National ID (PAN / Aadhar)</label>
              <input
                value={form.nationalId}
                onChange={(e) => setField("nationalId", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="ID number"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
              placeholder="Permanent / current address"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
              <input
                value={form.emergencyName}
                onChange={(e) => setField("emergencyName", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="Name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Relation</label>
              <input
                value={form.emergencyRelation}
                onChange={(e) => setField("emergencyRelation", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="Relation"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Emergency Phone</label>
              <input
                value={form.emergencyPhone}
                onChange={(e) => setField("emergencyPhone", e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                  errors.emergencyPhone ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"
                }`}
                placeholder="+91 98xxxx"
              />
              {errors.emergencyPhone && <p className="text-xs text-red-600 mt-1">{errors.emergencyPhone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={() => { /* no-op cancel for now, parent may handle */ }}
          className="px-4 py-2 rounded border text-sm bg-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Next: Work Info"}
        </button>
      </div>
    </form>
  );
}
