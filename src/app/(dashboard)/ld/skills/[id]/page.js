"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Brain, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ViewSkillPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchSkill();
    }
  }, [params.id]);

  const fetchSkill = async () => {
    try {
      setLoading(true);
      const response = await ldService.getSkillById(params.id);
      setSkill(response.data || response);
    } catch (error) {
      console.error("Error fetching skill:", error);
      toast.error("Failed to load skill details");
      setSkill(null);
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

  if (!skill) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Skill not found</p>
          <Link
            href="/ld/skills"
            className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Skills
          </Link>
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
          { label: skill.skillName, href: `/ld/skills/${params.id}` },
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
                Skill Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View skill information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/ld/skills"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/ld/skills/${params.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Skill Name</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {skill.skillName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {skill.category?.replace("_", " ") || skill.category}
            </p>
          </div>
          {skill.description && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {skill.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
