"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Brain, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

export default function EmployeeSkillViewPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await ldService.getEmployeeSkills(params.id);
      setDetail(response.data || response);
    } catch (error) {
      console.error("Error fetching employee skills:", error);
      toast.error("Failed to load employee skills");
      setDetail(null);
    } finally {
      setLoading(false);
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

  if (!detail) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Employee skills not found</p>
          <Link
            href="/ld/skills/employee"
            className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employee Skills
          </Link>
        </div>
      </div>
    );
  }

  const { employee, skills } = detail;

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Skills & Competency", href: "/ld/skills" },
          { label: "Employee Skills", href: "/ld/skills/employee" },
          { label: employee?.name || "Employee", href: `/ld/skills/employee/${params.id}` },
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
                {employee?.name || "Employee Skills"}
              </h2>
              {employee?.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/ld/skills/employee"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/ld/skills/employee/${params.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        {skills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No skills tagged</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {skill.skillName}
                </p>
                <p className="text-sm text-gray-500">
                  {skill.category?.replace("_", " ") || skill.category}
                </p>
                {skill.proficiencyLevel && (
                  <p className="text-sm text-gray-600 mt-2">
                    Proficiency: {skill.proficiencyLevel}
                  </p>
                )}
                {skill.description && (
                  <p className="text-sm text-gray-500 mt-2">{skill.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
