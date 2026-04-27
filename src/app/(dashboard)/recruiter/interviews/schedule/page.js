"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Calendar, Save, X } from "lucide-react";
import Link from "next/link";
import Select from "react-select";
import { employeeService } from "@/services/hr-services/employeeService";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [formData, setFormData] = useState({
    candidateId: "",
    jobTitle: "",
    interviewRound: "1",
    interviewer: [], // Changed to array for multi-select
    date: "",
    time: "",
    mode: "ONLINE",
    meetingLink: "",
    notes: "",
  });

  useEffect(() => {
    fetchCandidates();
    fetchEmployees();
  }, []);


  const fetchCandidates = async () => {
    try {
      const response = await recruiterService.getAllCandidates();
      const candidatesList = response.data || response || [];
      setCandidates(candidatesList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
      setCandidates([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Fetch all employees with a large limit to populate the dropdown
      const response = await employeeService.getAllEmployees({ limit: 1000, status: 'ACTIVE' });
      const employees = response.data || response.employees || [];

      const options = employees.map(emp => ({
        value: emp.email, // Use email as value or ID? Prompt says "fetch interviwer by name or email ... these email should be send in api"
        label: `${emp.firstName} ${emp.lastName} (${emp.email})`,
        email: emp.email,
        name: `${emp.firstName} ${emp.lastName}`
      }));
      setEmployeeOptions(options);
    } catch (error) {
      console.error("Error fetching employees:", error);
      // Don't block UI if employees fail to load, just show empty dropdown
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-fill job title if candidate is selected
    if (name === "candidateId") {
      const selectedCandidate = candidates.find((c) => c.id.toString() === value);
      if (selectedCandidate) {
        setFormData((prev) => ({ ...prev, jobTitle: selectedCandidate.jobTitle || "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      toast.error("Please select interview date");
      return;
    }
    if (!formData.time) {
      toast.error("Please select interview time");
      return;
    }
    if (formData.mode === "ONLINE" && !formData.meetingLink) {
      toast.error("Meeting link is mandatory for online interviews");
      return;
    }

    try {
      setLoading(true);
      await recruiterService.scheduleInterview(formData);
      toast.success("Interview scheduled successfully");
      router.push("/recruiter/interviews");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Interviews", href: "/recruiter/interviews" },
          { label: "Schedule Interview", href: "/recruiter/interviews/schedule" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Schedule Interview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Schedule a new interview for a candidate
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Candidate <span className="text-red-500">*</span>
              </label>
              <select
                name="candidateId"
                value={formData.candidateId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a candidate</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interview Round <span className="text-red-500">*</span>
              </label>
              <select
                name="interviewRound"
                value={formData.interviewRound}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="1">Round 1</option>
                <option value="2">Round 2</option>
                <option value="3">Round 3</option>
                <option value="FINAL">Final Round</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interviewers <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                name="interviewer"
                options={employeeOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) => {
                  setFormData({ ...formData, interviewer: selectedOptions });
                }}
                value={formData.interviewer || []}
                placeholder="Search and select interviewers..."
                required
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#D1D5DB', // gray-300
                    borderRadius: '0.5rem',
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999
                  })
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <DatePickerField
                id="interview-date"
                name="date"
                value={formData.date}
                onChange={(dateStr) => setFormData((prev) => ({ ...prev, date: dateStr }))}
                placeholder="Select interview date"
                className="rounded-lg"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select interview time</option>
                {Array.from({ length: 24 * 4 }).map((_, i) => {
                  const totalMinutes = i * 15;
                  const h = Math.floor(totalMinutes / 60);
                  const m = totalMinutes % 60;
                  const hour = h.toString().padStart(2, "0");
                  const min = m.toString().padStart(2, "0");
                  const displayHour = (h % 12 || 12).toString().padStart(2, "0");
                  const ampm = h < 12 ? "AM" : "PM";
                  return (
                    <option key={`${hour}:${min}`} value={`${hour}:${min}`}>
                      {`${displayHour}:${min} ${ampm}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mode <span className="text-red-500">*</span>
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In-person</option>
              </select>
            </div>

            {formData.mode === "ONLINE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add any notes about this interview..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/recruiter/interviews"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
