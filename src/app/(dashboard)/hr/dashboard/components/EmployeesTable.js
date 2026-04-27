import React from "react";
import Link from "next/link";

const EmployeesTable = () => {
  const employees = [
    {
      id: 1,
      name: "Anthony Lewis",
      position: "Finance",
      department: "Finance",
      avatar: "/images/users/user-13.jpg",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      id: 2,
      name: "Brian Villalobos",
      position: "PHP Developer",
      department: "Development",
      avatar: "/images/users/user-01.png",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    {
      id: 3,
      name: "Stephan Peralt",
      position: "Executive",
      department: "Marketing",
      avatar: "/images/users/user-02.png",
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    },
    {
      id: 4,
      name: "Doglas Martini",
      position: "Project Manager",
      department: "Manager",
      avatar: "/images/users/user-03.png",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
    {
      id: 5,
      name: "Anthony Lewis",
      position: "UI/UX Designer",
      department: "UI/UX Design",
      avatar: "/images/users/user-04.png",
      badgeColor: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    },
    {
      id: 6,
      name: "Sheshansingh Rajput",
      position: "UI/UX Designer",
      department: "UI/UX Design",
      avatar: "/images/users/user-10.jpg",
      badgeColor: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    },
    {
      id: 7,
      name: "Aayush Sharma",
      position: "UI/UX Designer",
      department: "UI/UX Design",
      avatar: "/images/users/user-11.jpg",
      badgeColor: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 
                      flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Employees
        </h5>
        <Link
          href="#"
          className="px-3 py-1 text-xs font-semibold rounded-md 
                     bg-gray-100 hover:bg-gray-200 text-gray-600 
                     dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          View All
        </Link>
      </div>

      {/* Table */}
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
                {/* Name */}
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

                {/* Department */}
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-sm whitespace-nowrap ${employee.badgeColor}`}
                  >
                    {employee.department}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesTable;
