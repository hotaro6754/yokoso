"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import DatePicker from "@/components/common/DatePicker";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { UserCheck, Save, X } from "lucide-react";
import Link from "next/link";

export default function CreateTrainingAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    assignedType: "EMPLOYEE",
    assignedTo: "",
    mandatory: false,
    startDate: "",
    completionDeadline: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await ldService.getAllCourses();
      const coursesList = response.data || response || [];
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: assignedTo is not required for ALL_EMPLOYEES
    if (formData.assignedType === "ALL_EMPLOYEES") {
      formData.assignedTo = "ALL";
    }
    
    try {
      setLoading(true);
      await ldService.createTrainingAssignment(formData);
      toast.success("Training assignment created successfully");
      router.push("/ld/training-assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create training assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Training Assignment", href: "/ld/training-assignments" },
          { label: "Assign Training", href: "/ld/training-assignments/create" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assign Training
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Assign courses to employees, departments, or roles
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                name="assignedType"
                value={formData.assignedType}
                onChange={(e) => {
                  handleChange(e);
                  // Clear assignedTo when switching to ALL_EMPLOYEES
                  if (e.target.value === "ALL_EMPLOYEES") {
                    setFormData({ ...formData, assignedType: e.target.value, assignedTo: "" });
                  } else {
                    handleChange(e);
                  }
                }}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="EMPLOYEE">Individual Employee</option>
                <option value="ALL_EMPLOYEES">All Employees</option>
                <option value="DEPARTMENT">Department</option>
                <option value="ROLE">Role / Designation</option>
              </select>
            </div>

            {formData.assignedType !== "ALL_EMPLOYEES" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.assignedType === "EMPLOYEE"
                    ? "Employee"
                    : formData.assignedType === "DEPARTMENT"
                    ? "Department"
                    : "Role"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                  placeholder={`Enter ${formData.assignedType.toLowerCase()}`}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment Scope
                </label>
                <div className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                  All employees in the organization
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                placeholder="dd-mm-yyyy"
                required
                minDate={new Date()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Completion Deadline <span className="text-red-500">*</span>
              </label>
              <DatePicker
                name="completionDeadline"
                value={formData.completionDeadline}
                onChange={handleChange}
                placeholder="dd-mm-yyyy"
                required
                minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="mandatory"
                  checked={formData.mandatory}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as Mandatory
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/ld/training-assignments"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
