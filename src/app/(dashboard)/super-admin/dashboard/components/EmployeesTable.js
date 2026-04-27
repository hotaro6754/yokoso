import React, { useEffect, useState } from "react";
import Link from "next/link";
import { employeeService } from "@/services/hr-services/employeeService";

export default function EmployeesTable() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await employeeService.getAllEmployees({ page: 1, limit: 5 });

        if (!active) return;
        const data = response?.success ? response.data : response;
        const list = data || [];

        const formatted = list.map((emp) => {
          const name = emp?.name || [emp?.firstName, emp?.lastName].filter(Boolean).join(" ") || emp?.email || "Employee";
          const department = emp?.department?.name || emp?.department || "N/A";
          const position = emp?.designation?.name || emp?.designation || "N/A";
          const avatar = emp?.profileImage || emp?.avatarUrl || "/images/users/default-avatar.png";

          return {
            id: emp?.id || emp?.publicId || name,
            name,
            position,
            department,
            avatar,
            badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          };
        });

        setEmployees(formatted);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load employees");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchEmployees();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Employees
        </h5>
        <Link
          href="/company-admin/users"
          className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[420px] w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Department
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {employee.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {employee.position}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <span className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-sm whitespace-nowrap ${employee.badgeColor}`}>
                    {employee.department}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error ? (
        <div className="px-4 pb-4">
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      ) : loading ? (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 dark:text-gray-300">Loading employees...</p>
        </div>
      ) : null}
    </div>
  );
}

