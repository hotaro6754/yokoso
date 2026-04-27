"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Loader2, Search } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import employeeService from "@/services/hr-services/employeeService";
import { payrollService } from "@/services/hr-services/payroll.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";

export default function EmployeeCompensationPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, departmentFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, itemsPerPage]);

  const fetchDepartments = async () => {
    try {
      const response = await organizationService.getAllDepartments({ limit: 100 });
      const deptData = response.success ? response.data?.departments || response.data : response.data || [];
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = { limit: 100, status: "all" };
      if (searchTerm) params.search = searchTerm;
      if (departmentFilter !== "all") params.departmentId = departmentFilter;

      const response = await employeeService.getAllEmployees(params);
      const employeeList = response.success
        ? response.data?.employees || response.data || []
        : response.data?.employees || response.data || [];
      setEmployees(Array.isArray(employeeList) ? employeeList : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error(error.message || "Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const name = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
      const matchesSearch = !searchTerm || 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === "all" || 
        employee.department?.id?.toString() === departmentFilter ||
        employee.departmentId?.toString() === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, departmentFilter]);

  const totalItems = filteredEmployees.length;

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const getSalaryStatus = (employee) => {
    const structure = employee.salaryStructure || employee.salary;
    if (!structure) return { label: "Not Set", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" };
    if (structure.status === "ACTIVE" || structure.isActive) {
      return { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
    }
    return { label: "On Hold", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" };
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Payroll Overview", href: "/hr/payroll" },
          { label: "Employee Compensation" },
        ]}
      />

      <div className="mt-6 mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employee Compensation Overview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View high-level salary structure to answer employee queries (Read-only).
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or Employee ID"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/70 text-xs uppercase text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Employee Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Employee ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Department</th>
                  <th className="px-4 py-3 text-left font-semibold">Designation</th>
                  <th className="px-4 py-3 text-left font-semibold">Employment Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Date of Joining</th>
                  <th className="px-4 py-3 text-left font-semibold">CTC (Annual)</th>
                  <th className="px-4 py-3 text-left font-semibold">Monthly Gross</th>
                  <th className="px-4 py-3 text-left font-semibold">Salary Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                {paginatedEmployees.map((employee) => {
                  const name = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
                  const structure = employee.salaryStructure || employee.salary || {};
                  const ctc = structure.totalCTC || structure.annualCTC || structure.ctc || 0;
                  const monthlyGross = structure.monthlyGross || structure.grossSalary || (ctc / 12) || 0;
                  const status = getSalaryStatus(employee);
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={employee.profileImage || "/images/users/user-default.png"}
                            alt={name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">{name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {employee.employeeId || employee.publicId || "ID pending"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {typeof employee.department === "string"
                          ? employee.department
                          : employee.department?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {employee.designation?.name || employee.jobTitle || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {employee.employmentType || employee.employeeType || "Full-time"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {employee.joiningDate || employee.dateOfJoining
                          ? new Date(employee.joiningDate || employee.dateOfJoining).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {ctc > 0 ? payrollService.formatCurrency(ctc) : "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {monthlyGross > 0 ? payrollService.formatCurrency(monthlyGross) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (
        <Pagination
          className="mt-6"
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          showWhenEmpty={true}
        />
      )}
    </div>
  );
}
