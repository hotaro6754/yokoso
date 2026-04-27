"use client";

import { useState, useEffect } from "react";
import { Briefcase, Edit, Loader2, RefreshCw, Users, User, Calendar, Upload, Bell, MapPin } from "lucide-react";
import { workforceService } from "@/services/hr-services/workforce.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import ShiftAssignmentModal from "./ShiftAssignmentModal";
import GeneralAssignShiftModal from "./GeneralAssignShiftModal";
import ImportShiftModal from "./ImportShiftModal";
import ConfirmationModal from "./ConfirmationModal";

export default function ShiftAssignmentTab() {
  const [shiftAssignments, setShiftAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: "all",
    shift: "",
    employeeId: "",
  });
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    fetchShiftAssignments();
  }, [filters, selectedMonth, selectedYear]);

  const fetchDepartments = async () => {
    try {
      const response = await organizationService.getAllDepartments({ limit: 100 });
      const deptData = response.success ? response.data?.departments || response.data : response.data || [];
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const { employeeService } = await import("@/services/hr-services/employeeService");
      const res = await employeeService.getAllEmployees();
      const members = res?.data || res || [];
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchShiftAssignments = async () => {
    try {
      setLoading(true);
      const params = {
        departmentId: filters.departmentId !== "all" ? filters.departmentId : "all",
        month: selectedMonth,
        year: selectedYear
      };
      if (filters.shift) {
        params.shift = filters.shift;
      }
      if (filters.employeeId) {
        params.employeeId = filters.employeeId;
      }

      const response = await workforceService.getShiftAssignments(params);
      const data = response.success ? response.data : response.data || [];
      setShiftAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shift assignments:", error);
      toast.error(error.message || "Failed to fetch shift assignments");
      setShiftAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    setIsPublishConfirmOpen(true);
  };

  const confirmPublish = async () => {
    try {
      const { shiftManagementService } = await import("@/services/manager-services/shiftManagement.service");
      await shiftManagementService.publishRoster(selectedMonth, selectedYear);
      toast.success("Roster Published Successfully");
      fetchShiftAssignments();
    } catch (error) {
      toast.error(error.message || "Failed to publish roster");
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleModalSuccess = () => {
    fetchShiftAssignments();
    handleModalClose();
  };

  const shiftOptions = ["Morning", "Afternoon", "Night", "General", "Flexible & Rotation"];

  return (
    <div className="space-y-6">
      {/* Top Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-200"
        >
          <Calendar size={16} /> Assign Shift
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-200"
        >
          <Upload size={16} /> Import Roster
        </button>
        <button
          onClick={handlePublish}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-sm text-sm font-semibold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Bell size={16} /> Publish & Notify
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-sm p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap items-end gap-6 text-sm">
          <div className="flex-1 min-w-[200px]">
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wider">
               Month & Year
             </label>
             <div className="flex items-center gap-2">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all font-medium"
                >
                   {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</option>
                   ))}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all font-medium"
                >
                   {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
             </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wider">
              Department
            </label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all font-medium"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wider">
              Shift
            </label>
            <select
              value={filters.shift}
              onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all font-medium"
            >
              <option value="">All Shifts</option>
              {shiftOptions.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchShiftAssignments}
            className="h-[42px] px-6 bg-brand-500 text-white rounded-sm hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm shadow-brand-500/5">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : shiftAssignments.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-5 bg-brand-50 dark:bg-brand-500/5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-brand-500/50" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No shift assignments found for this period</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting filters or importing a roster</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Work Location
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {shiftAssignments.map((employee) => (
                  <tr
                    key={employee.id || employee.publicId}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`h-10 w-10 rounded-full mr-3 bg-brand-100 dark:bg-brand-500/10 flex items-center justify-center`}
                        >
                          <User className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                            {employee.employeeName || employee.name || `${employee.firstName} ${employee.lastName}`}
                          </p>
                          <p className="text-[10px] items-center gap-1 mt-1 font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded inline-flex uppercase">
                            {employee.employeeCode || employee.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {employee.department || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {employee.designation || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {employee.shift || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                         <MapPin size={14} className="text-gray-400" />
                         {employee.workLocation || employee.location || "Office"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2.5 rounded-sm bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white transition-all dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500 dark:hover:text-white shadow-sm border border-brand-100 dark:border-brand-500/20"
                        title="Edit Shift"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <ShiftAssignmentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          employee={selectedEmployee}
          onSuccess={handleModalSuccess}
        />
      )}

      {isImportModalOpen && (
        <ImportShiftModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={() => {
             setIsImportModalOpen(false);
             fetchShiftAssignments();
          }}
          teamMembers={teamMembers}
        />
      )}
      
      {isAssignModalOpen && (
        <GeneralAssignShiftModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => {
             setIsAssignModalOpen(false);
             fetchShiftAssignments();
          }}
          teamMembers={teamMembers}
        />
      )}

      {isPublishConfirmOpen && (
        <ConfirmationModal
          isOpen={isPublishConfirmOpen}
          onClose={() => setIsPublishConfirmOpen(false)}
          onConfirm={confirmPublish}
          title="Publish Roster"
          message={`Are you sure you want to publish the roster for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}? This will trigger notifications for all employees.`}
          confirmText="Publish & Notify"
        />
      )}
    </div>
  );
}
