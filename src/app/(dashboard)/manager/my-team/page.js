"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Users, Network, MoreVertical, User, Clock, CalendarCheck, Target } from "lucide-react";
import { managerTeamService } from "@/services/manager-services/team.service";
import TablePagination from "@/components/common/TablePagination";

export default function ManagerMyTeamPage() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [teamData, setTeamData] = useState({ teamMembers: [], hierarchyMembers: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [error, setError] = useState("");
  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "My Team", href: "/manager/my-team" },
  ];

  const handleActionClick = (e, id) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      // Position dropdown below button, right aligned
      // Dropdown width is w-44 (approx 176px)
      const dropdownWidth = 176;
      let left = rect.right - dropdownWidth;

      // Ensure it doesn't go off-screen left
      if (left < 10) left = rect.left;

      setMenuPosition({
        top: rect.bottom + 5,
        left: left
      });
      setOpenMenuId(id);
    }
  };

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    // Use capture for scroll to close immediately on scroll
    window.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, []);

  const statusTone = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700";
      case "On Leave":
        return "bg-amber-100 text-amber-700";
      case "Notice Period":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    let active = true;

    const fetchTeam = async () => {
      try {
        const data = await managerTeamService.getTeamOverview(pagination.page, pagination.limit);
        if (!active) return;
        setTeamData({
          teamMembers: data?.teamMembers || [],
          hierarchyMembers: data?.hierarchyMembers || []
        });
        if (data?.pagination) {
          setPagination(prev => ({ ...prev, ...data.pagination }));
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load team overview");
      }
    };

    fetchTeam();

    return () => {
      active = false;
    };
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                <Users className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Team</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Direct and dotted-line reportees</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {teamData.teamMembers.length} members
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Work Mode</th>
                  <th className="px-4 py-3 font-medium">Leave Balance</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamData.teamMembers.map((member) => (
                  <tr key={member.id} className="border-t border-gray-200/60 dark:border-gray-700/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{member.designation}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${statusTone(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{member.workMode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{member.leaveBalance}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">days</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => handleActionClick(e, member.id)}
                          className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          aria-label="Open actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </div>

        {/* Global Action Menu - Fixed Position */}
        {openMenuId && (
          <div
            className="fixed w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 z-50 flex flex-col gap-1"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`/manager/team/profile/${openMenuId}`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setOpenMenuId(null)}
            >
              <User size={14} /> Profile
            </Link>
            <Link
              href={`/manager/team/attendance/${openMenuId}`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setOpenMenuId(null)}
            >
              <Clock size={14} /> Attendance
            </Link>
            <Link
              href={`/manager/team/leave/${openMenuId}`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setOpenMenuId(null)}
            >
              <CalendarCheck size={14} /> Leave
            </Link>
            <Link
              href={`/manager/team/performance/${openMenuId}`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setOpenMenuId(null)}
            >
              <Target size={14} /> Performance
            </Link>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
              <Network className="text-primary-600 dark:text-primary-400" size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Reporting Structure</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Team hierarchy view</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamData.hierarchyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-3"
              >
                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-200">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
