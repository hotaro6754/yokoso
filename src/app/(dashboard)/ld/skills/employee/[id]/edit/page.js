"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Brain, ArrowLeft, Save, Search } from "lucide-react";
import Link from "next/link";

export default function EmployeeSkillEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsRes, employeeRes] = await Promise.all([
        ldService.getAllSkills(),
        ldService.getEmployeeSkills(params.id)
      ]);
      const skillsList = skillsRes.data || skillsRes || [];
      const employeeDetail = employeeRes.data || employeeRes || {};
      const initialSelected = {};
      (employeeDetail.skills || []).forEach((skill) => {
        initialSelected[skill.id] = {
          selected: true,
          proficiencyLevel: skill.proficiencyLevel || ""
        };
      });
      setSkills(skillsList);
      setEmployee(employeeDetail.employee || null);
      setSelected(initialSelected);
    } catch (error) {
      console.error("Error loading employee skills:", error);
      toast.error("Failed to load employee skills");
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = useMemo(() => {
    if (!search) return skills;
    const term = search.toLowerCase();
    return skills.filter((skill) =>
      skill.skillName?.toLowerCase().includes(term)
    );
  }, [skills, search]);

  const handleToggle = (skillId) => {
    setSelected((prev) => {
      const current = prev[skillId] || { selected: false, proficiencyLevel: "" };
      return {
        ...prev,
        [skillId]: {
          ...current,
          selected: !current.selected
        }
      };
    });
  };

  const handleProficiencyChange = (skillId, value) => {
    setSelected((prev) => ({
      ...prev,
      [skillId]: {
        ...(prev[skillId] || { selected: true }),
        proficiencyLevel: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const selectedSkillIds = Object.entries(selected)
        .filter(([, value]) => value.selected)
        .map(([skillId]) => parseInt(skillId));

      const existingSkillIds = Object.entries(selected)
        .filter(([, value]) => value.selected)
        .map(([skillId]) => parseInt(skillId));

      const removeIds = skills
        .map((skill) => skill.id)
        .filter((id) => !selectedSkillIds.includes(id));

      const addOrUpdatePromises = selectedSkillIds.map((skillId) =>
        ldService.tagEmployeeSkill(params.id, {
          skillId,
          proficiencyLevel: selected[skillId]?.proficiencyLevel || ""
        })
      );

      const removePromises = removeIds.map((skillId) =>
        ldService.removeEmployeeSkill(params.id, skillId)
      );

      await Promise.all([...addOrUpdatePromises, ...removePromises]);
      toast.success("Employee skills updated");
      router.push(`/ld/skills/employee/${params.id}`);
    } catch (error) {
      console.error("Error updating employee skills:", error);
      toast.error("Failed to update employee skills");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          { label: "Skills & Competency", href: "/ld/skills" },
          { label: "Employee Skills", href: "/ld/skills/employee" },
          { label: "Edit Skills", href: `/ld/skills/employee/${params.id}/edit` },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {employee?.name || "Edit Employee Skills"}
              </h2>
              {employee?.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
              )}
            </div>
          </div>
          <Link
            href={`/ld/skills/employee/${params.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {filteredSkills.length === 0 ? (
          <p className="text-sm text-gray-500">No skills found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => {
              const state = selected[skill.id] || { selected: false, proficiencyLevel: "" };
              return (
                <div
                  key={skill.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={state.selected}
                      onChange={() => handleToggle(skill.id)}
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
                  {state.selected && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-500 mb-1">
                        Proficiency Level
                      </label>
                      <input
                        type="text"
                        value={state.proficiencyLevel}
                        onChange={(e) => handleProficiencyChange(skill.id, e.target.value)}
                        placeholder="e.g., Beginner, Intermediate, Expert"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
