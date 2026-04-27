"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { deptHeadTeamService } from "@/services/dept-head-services/team.service";
import { toast } from "react-hot-toast";
import { Users, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "INACTIVE", label: "Inactive" }
];

export default function TeamMemberEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await deptHeadTeamService.getManagerById(params.id);
      const data = response.data || response;
      setMember(data);
      setStatus(data.employmentStatus || "ACTIVE");
    } catch (error) {
      console.error("Error fetching manager:", error);
      toast.error("Failed to load manager details");
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await deptHeadTeamService.updateManagerStatus(params.id, status);
      toast.success("Manager updated");
      router.push(`/dept-head/team-management/${params.id}`);
    } catch (error) {
      console.error("Error updating manager:", error);
      toast.error("Failed to update manager");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Manager not found</p>
          <Link
            href="/dept-head/team-management"
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Department Head", href: "/dept-head" },
          { label: "Team Management", href: "/dept-head/team-management" },
          { label: member.name, href: `/dept-head/team-management/${params.id}` },
          { label: "Edit", href: `/dept-head/team-management/${params.id}/edit` },
        ]}
      />

      <div className="mb-6 mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Manager</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/dept-head/team-management/${params.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
