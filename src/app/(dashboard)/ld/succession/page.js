"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Users, AlertCircle, User } from "lucide-react";
import Link from "next/link";
import ActionDropdown from "../components/ActionDropdown";

export default function SuccessionPage() {
  const [loading, setLoading] = useState(true);
  const [successionRoles, setSuccessionRoles] = useState([]);
  const [filters, setFilters] = useState({ roleType: "", search: "" });

  useEffect(() => {
    fetchSuccessionRoles();
  }, [filters]);

  const fetchSuccessionRoles = async () => {
    try {
      setLoading(true);
      const response = await ldService.getSuccessionRoles(filters);
      setSuccessionRoles(response.data || response || []);
    } catch (error) {
      console.error("Error fetching succession roles:", error);
      toast.error("Failed to load succession data");
      setSuccessionRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessBadge = (level) => {
    const levelMap = {
      HIGH: { label: "High (Ready Now)", color: "bg-emerald-100 text-emerald-800" },
      MEDIUM: { label: "Medium (1-2 Years)", color: "bg-amber-100 text-amber-800" },
      LOW: { label: "Low (Needs Development)", color: "bg-red-100 text-red-800" },
    };
    const levelInfo = levelMap[level] || levelMap.LOW;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}>
        {levelInfo.label}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Talent & Succession", href: "/ld/succession" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Talent & Succession Overview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Basic succession readiness view
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search roles..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={filters.roleType}
            onChange={(e) => setFilters({ ...filters, roleType: e.target.value })}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Role Types</option>
            <option value="BUSINESS_CRITICAL">Business Critical</option>
            <option value="LEADERSHIP">Leadership Role</option>
          </select>
        </div>
      </div>

      {/* Succession Roles */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : successionRoles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No succession roles found</p>
          </div>
        ) : (
          successionRoles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {role.roleName}
                    </h3>
                    {role.isCritical && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Critical
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {role.roleType?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <ActionDropdown
                  itemId={role.id}
                  viewUrl={`/ld/succession/${role.id}`}
                  editUrl={`/ld/succession/${role.id}/edit`}
                />
              </div>

              {role.successors && role.successors.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Potential Successors
                  </h4>
                  <div className="space-y-2">
                    {role.successors.map((successor) => (
                      <div
                        key={successor.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {successor.employeeName}
                          </span>
                        </div>
                        {getReadinessBadge(successor.readinessLevel)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-800 dark:text-amber-300">
                      No successors identified
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
