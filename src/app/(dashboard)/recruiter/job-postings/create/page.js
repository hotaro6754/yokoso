"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Briefcase, Save, X, ChevronDown, Search } from "lucide-react";
import Link from "next/link";

export default function CreateJobPostingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  const [formData, setFormData] = useState({
    requisitionId: "",
    jobTitle: "",
    description: "",
    location: "",
    employmentType: "FULL_TIME",
    experienceRequired: "",
    skillsRequired: "",
    status: "DRAFT",
  });

  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchApprovedJobs = async (search = "") => {
    try {
      setSearching(true);
      const params = { limit: 50 };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await recruiterService.getApprovedJobs(params);
      const jobs = response.data || [];
      setApprovedJobs(jobs);
      setFilteredJobs(jobs);
    } catch (error) {
      console.error("Error fetching approved jobs:", error);
      toast.error("Failed to load approved jobs");
      setApprovedJobs([]);
      setFilteredJobs([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (showDropdown) {
        fetchApprovedJobs(searchQuery);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, showDropdown]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Filter locally first
    if (value.trim()) {
      const filtered = approvedJobs.filter(job =>
        job.title?.toLowerCase().includes(value.toLowerCase()) ||
        job.department?.toLowerCase().includes(value.toLowerCase()) ||
        job.designation?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(approvedJobs);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setSearchQuery(job.title || "");
    setShowDropdown(false);
    setFormData({
      ...formData,
      requisitionId: job.id,
      jobTitle: job.title || "",
      description: job.description || "",
      location: job.location || "",
      employmentType: job.employmentType || "FULL_TIME",
      experienceRequired: job.experienceMin && job.experienceMax 
        ? `${job.experienceMin}-${job.experienceMax} years`
        : "",
      skillsRequired: Array.isArray(job.skills) 
        ? job.skills.join(", ")
        : job.skills || "",
    });
  };

  const handleDropdownFocus = () => {
    setShowDropdown(true);
    if (approvedJobs.length === 0) {
      fetchApprovedJobs();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await recruiterService.createJobPosting(formData);
      toast.success("Job posting created successfully");
      router.push("/recruiter/job-postings");
    } catch (error) {
      console.error("Error creating job posting:", error);
      toast.error("Failed to create job posting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Job Postings", href: "/recruiter/job-postings" },
          { label: "Create Posting", href: "/recruiter/job-postings/create" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Job Posting
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a new job posting from an approved requisition
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Requisition <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleDropdownFocus}
                  placeholder="Select a requisition"
                  required
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600">
                    {searching ? (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        Searching...
                      </div>
                    ) : filteredJobs.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No approved jobs found
                      </div>
                    ) : (
                      filteredJobs.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => handleSelectJob(job)}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {job.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {job.department} • {job.location} • {job.employmentType}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedJob && (
                <input type="hidden" name="requisitionId" value={formData.requisitionId} required />
              )}
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
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Required
              </label>
              <input
                type="text"
                name="experienceRequired"
                value={formData.experienceRequired}
                onChange={handleChange}
                placeholder="e.g., 3-5 years"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter job description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skills Required
            </label>
            <textarea
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter required skills (comma-separated or one per line)..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/recruiter/job-postings"
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
              {loading ? "Creating..." : "Create Posting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
