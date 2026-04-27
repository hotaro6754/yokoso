"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Users, ArrowLeft, User } from "lucide-react";
import Link from "next/link";

const readinessLabel = {
  HIGH: "High (Ready Now)",
  MEDIUM: "Medium (1-2 Years)",
  LOW: "Low (Needs Development)",
};

const readinessColor = {
  HIGH: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-red-100 text-red-800",
};

export default function SuccessionRoleViewPage() {
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
      const response = await ldService.getSuccessionRoleById(params.id);
      setDetail(response.data || response);
    } catch (error) {
      console.error("Error fetching succession role:", error);
      toast.error("Failed to load succession role");
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
          <p className="text-gray-500 dark:text-gray-400">Succession role not found</p>
          <Link
            href="/ld/succession"
            className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Succession
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
          { label: "Talent & Succession", href: "/ld/succession" },
          { label: detail.roleName, href: `/ld/succession/${params.id}` },
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
                {detail.roleName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {detail.roleType?.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/ld/succession"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/ld/succession/${params.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          {detail.isCritical && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Critical Role
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {detail.roleType?.replace("_", " ")}
          </span>
        </div>

        {detail.successors.length === 0 ? (
          <p className="text-sm text-gray-500">No successors identified.</p>
        ) : (
          <div className="space-y-3">
            {detail.successors.map((successor) => (
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
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    readinessColor[successor.readinessLevel] || readinessColor.LOW
                  }`}
                >
                  {readinessLabel[successor.readinessLevel] || readinessLabel.LOW}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
