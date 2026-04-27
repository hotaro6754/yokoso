"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Loader2, CheckCircle, Clock } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import employeeService from "@/services/hr-services/employeeService";
import { toast } from "react-hot-toast";

export default function PayrollQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    issueType: "",
    description: "",
    status: "OPEN",
    assignedTo: "PAYROLL_ADMIN",
  });

  useEffect(() => {
    fetchQueries();
    fetchEmployees();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem("payroll_queries");
      const data = saved ? JSON.parse(saved) : [];
      setQueries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching queries:", error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees({ limit: 100 });
      const employeeList = response.success
        ? response.data?.employees || response.data || []
        : response.data?.employees || response.data || [];
      setEmployees(Array.isArray(employeeList) ? employeeList : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.issueType || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    const newQuery = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: "HR",
    };

    const updated = [newQuery, ...queries];
    setQueries(updated);
    localStorage.setItem("payroll_queries", JSON.stringify(updated));
    toast.success("Payroll query logged successfully");
    setIsModalOpen(false);
    setFormData({
      employeeId: "",
      issueType: "",
      description: "",
      status: "OPEN",
      assignedTo: "PAYROLL_ADMIN",
    });
  };

  const handleStatusChange = (queryId, newStatus) => {
    const updated = queries.map((q) => (q.id === queryId ? { ...q, status: newStatus } : q));
    setQueries(updated);
    localStorage.setItem("payroll_queries", JSON.stringify(updated));
    toast.success("Query status updated");
  };

  const getStatusBadge = (status) => {
    const config = {
      OPEN: { label: "Open", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
      RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
    };
    const statusConfig = config[status] || config.OPEN;
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </span>
    );
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((e) => e.id?.toString() === employeeId?.toString());
    if (!employee) return "Unknown Employee";
    return employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Payroll Overview", href: "/hr/payroll" },
          { label: "Payroll Queries" },
        ]}
      />

      <div className="mt-6 mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payroll Queries / Notes
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Log employee payroll-related issues for coordination with Payroll team.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold"
          >
            <Plus className="h-4 w-4" />
            Log Query
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : queries.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No payroll queries logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Employee</th>
                  <th className="px-4 py-3 text-left font-medium">Issue Type</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned To</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {queries.map((query) => (
                  <tr key={query.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {getEmployeeName(query.employeeId)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{query.issueType}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {query.description}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(query.status)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {query.assignedTo === "PAYROLL_ADMIN" ? "Payroll Admin" : query.assignedTo}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {query.createdAt ? (() => {
                        const date = new Date(query.createdAt);
                        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                      })() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {query.status === "OPEN" && (
                        <button
                          onClick={() => handleStatusChange(query.id, "RESOLVED")}
                          className="text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PayrollQueryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employees={employees}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function PayrollQueryModal({ isOpen, onClose, employees, formData, setFormData, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Log Payroll Query</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()} ({emp.employeeId || emp.publicId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.issueType}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select issue type</option>
              <option value="Payslip">Payslip</option>
              <option value="Salary Clarification">Salary Clarification</option>
              <option value="Deduction Query">Deduction Query</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe the payroll issue..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assigned To
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="PAYROLL_ADMIN">Payroll Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-semibold"
            >
              Log Query
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
