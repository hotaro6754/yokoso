"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Brain, Save, Search } from "lucide-react";

export default function RoleSkillMappingPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [roleSkills, setRoleSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchAvailableSkills();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRoleSkills();
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    try {
      const response = await ldService.getLdRoles();
      setRoles(response.data || response || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await ldService.getAllSkills();
      setAvailableSkills(response.data || response || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setAvailableSkills([]);
    }
  };

  const fetchRoleSkills = async () => {
    try {
      const response = await ldService.getRoleSkillMapping(selectedRole);
      setRoleSkills(response.data?.skills || response?.skills || []);
    } catch (error) {
      console.error("Error fetching role skills:", error);
      setRoleSkills([]);
    }
  };

  const handleSkillToggle = (skillId) => {
    setRoleSkills((prev) => {
      if (prev.includes(skillId)) {
        return prev.filter((id) => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    try {
      setSaving(true);
      await ldService.updateRoleSkillMapping(selectedRole, roleSkills);
      toast.success("Role-skill mapping updated successfully");
    } catch (error) {
      console.error("Error updating role skills:", error);
      toast.error("Failed to update role-skill mapping");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Skills & Competency", href: "/ld/skills" },
          { label: "Role-Skill Mapping", href: "/ld/skills/role-mapping" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Role-Skill Mapping
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Map required skills to roles
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Role <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedRole || ""}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {selectedRole && (
          <>
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Required Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {availableSkills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={roleSkills.includes(skill.id)}
                      onChange={() => handleSkillToggle(skill.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {skill.skillName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {skill.category?.replace("_", " ")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Mapping"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
