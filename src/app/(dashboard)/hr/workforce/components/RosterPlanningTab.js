"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Loader2, Save, User, Upload, Bell } from "lucide-react";
import { workforceService } from "@/services/hr-services/workforce.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";
import ImportRosterModal from "./ImportRosterModal";
import PublishRosterModal from "./PublishRosterModal";

export default function RosterPlanningTab() {
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Get Monday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [weekStartDate, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await organizationService.getAllDepartments({ limit: 100 });
      const deptData = response.success ? response.data?.departments || response.data : response.data || [];
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const params = {
        weekStartDate,
        departmentId: selectedDepartment !== "all" ? selectedDepartment : "all",
      };

      const response = await workforceService.getRoster(params);
      const data = response.success ? response.data : response;
      setRosterData(data);
    } catch (error) {
      console.error("Error fetching roster:", error);
      toast.error(error.message || "Failed to fetch roster");
      setRosterData(null);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction) => {
    const currentDate = new Date(weekStartDate);
    const daysToAdd = direction === "next" ? 7 : -7;
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    setWeekStartDate(currentDate.toISOString().split("T")[0]);
  };

  const handleImportSuccess = () => {
    setIsImportModalOpen(false);
    fetchRoster();
  };

  const confirmPublish = async () => {
    try {
      setIsPublishing(true);
      const date = new Date(weekStartDate);
      await workforceService.publishRoster(date.getMonth() + 1, date.getFullYear());
      toast.success("Roster published successfully");
      setIsPublishModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to publish roster");
    } finally {
      setIsPublishing(false);
    }
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const days = rosterData?.days || [];
  const roster = rosterData?.roster || [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-brand-50 dark:hover:bg-brand-500/20 hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <DatePickerField
              value={weekStartDate}
              onChange={(value) => setWeekStartDate(value)}
              placeholder="Select week start"
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
            />
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-brand-50 dark:hover:bg-brand-500/20 hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-200"
            >
              <Upload size={16} /> Import Roster
            </button>
            <button 
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-sm text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
            >
              <Bell size={16} /> Publish & Notify
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : roster.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-brand-500 dark:text-brand-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No roster data found for this week</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5 z-10">
                    Employee
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[150px]"
                    >
                      <div>{getDayName(day)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {formatDate(day)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {roster.map((item) => (
                  <tr
                    key={item.employee?.id || item.employee?.publicId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        {item.employee?.profileImage ? (
                          <img
                            src={item.employee.profileImage}
                            alt={item.employee?.name}
                            className="h-8 w-8 rounded-full object-cover mr-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-8 w-8 rounded-full mr-2 bg-gray-200 dark:bg-gray-600 flex items-center justify-center ${
                            item.employee?.profileImage ? 'hidden' : 'flex'
                          }`}
                          style={{ display: item.employee?.profileImage ? 'none' : 'flex' }}
                        >
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.employee?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.employee?.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    {days.map((day) => {
                      const scheduleItem = item.schedule?.find((s) => s.date === day);
                      return (
                        <td key={day} className="px-4 py-3 text-center">
                          {scheduleItem ? (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-900 dark:text-white">
                                {scheduleItem.shift || item.defaultShift || "-"}
                              </div>
                              <div className="text-xs">
                                <span
                                  className={`px-2 py-0.5 rounded ${
                                    scheduleItem.workMode === "WFO"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : scheduleItem.workMode === "WFH"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                  }`}
                                >
                                  {scheduleItem.workMode || item.defaultWorkMode || "-"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">
                              {item.defaultShift && item.defaultWorkMode
                                ? `${item.defaultShift} / ${item.defaultWorkMode}`
                                : "-"}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ImportRosterModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <PublishRosterModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={confirmPublish}
        month={new Date(weekStartDate).getMonth() + 1}
        year={new Date(weekStartDate).getFullYear()}
        submitting={isPublishing}
      />
    </div>
  );
}
