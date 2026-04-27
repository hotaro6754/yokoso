"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Users, ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";

const READINESS_LEVELS = ["HIGH", "MEDIUM", "LOW"];

export default function SuccessionRoleEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    roleType: "LEADERSHIP",
    isCritical: false,
  });
  const [newSuccessor, setNewSuccessor] = useState({
    employeeId: "",
    readinessLevel: "LOW",
  });

  useEffect(() => {
    if (params.id) {
      fetchDetail();
      fetchEmployees();
    }
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await ldService.getSuccessionRoleById(params.id);
      const data = response.data || response;
      setDetail(data);
      setForm({
        roleType: data.roleType || "LEADERSHIP",
        isCritical: !!data.isCritical,
      });
    } catch (error) {
      console.error("Error fetching succession role:", error);
      toast.error("Failed to load succession role");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await ldService.getSuccessionEmployees();
      setEmployees(response.data || response || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };

  const handleSaveRole = async () => {
    try {
      setSaving(true);
      await ldService.markRoleAsCritical(params.id, form.isCritical, form.roleType);
      toast.success("Role updated");
      await fetchDetail();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSuccessor = async () => {
    if (!newSuccessor.employeeId) {
      toast.error("Select an employee");
      return;
    }
    try {
      setSaving(true);
      await ldService.addSuccessor(params.id, {
        employeeId: parseInt(newSuccessor.employeeId),
        readinessLevel: newSuccessor.readinessLevel,
      });
      toast.success("Successor added");
      setNewSuccessor({ employeeId: "", readinessLevel: "LOW" });
      await fetchDetail();
    } catch (error) {
      console.error("Error adding successor:", error);
      toast.error("Failed to add successor");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateReadiness = async (successorId, readinessLevel) => {
    try {
      setSaving(true);
      await ldService.updateSuccessorReadiness(params.id, successorId, readinessLevel);
      toast.success("Readiness updated");
      await fetchDetail();
    } catch (error) {
      console.error("Error updating readiness:", error);
      toast.error("Failed to update readiness");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !detail) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Talent & Succession", href: "/ld/succession" },
          { label: detail.roleName, href: `/ld/succession/${params.id}` },
          { label: "Edit", href: `/ld/succession/${params.id}/edit` },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Succession Role
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {detail.roleName}
              </p>
            </div>
          </div>
          <Link
            href={`/ld/succession/${params.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role Type
            </label>
            <select
              value={form.roleType}
              onChange={(e) => setForm({ ...form, roleType: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="BUSINESS_CRITICAL">Business Critical</option>
              <option value="LEADERSHIP">Leadership Role</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-8">
            <input
              type="checkbox"
              checked={form.isCritical}
              onChange={(e) => setForm({ ...form, isCritical: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Mark as critical</span>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleSaveRole}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Role"}
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Successors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={newSuccessor.employeeId}
              onChange={(e) => setNewSuccessor({ ...newSuccessor, employeeId: e.target.value })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <select
              value={newSuccessor.readinessLevel}
              onChange={(e) => setNewSuccessor({ ...newSuccessor, readinessLevel: e.target.value })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {READINESS_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddSuccessor}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Successor
            </button>
          </div>

          {detail.successors.length === 0 ? (
            <p className="text-sm text-gray-500">No successors added yet.</p>
          ) : (
            <div className="space-y-2">
              {detail.successors.map((successor) => (
                <div
                  key={successor.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {successor.employeeName}
                  </span>
                  <select
                    value={successor.readinessLevel}
                    onChange={(e) => handleUpdateReadiness(successor.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {READINESS_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
