"use client";

import { Upload, FileText } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DocumentStatsCards from "./components/DocumentStatsCards";
import DocumentTable from "./components/DocumentTable";
import Link from "next/link";

export default function DocumentManagementPage() {
  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Document Management", href: "/hr/document-management" },
        ]}
        rightContent={
          <Link
            href="/hr/employees"
            className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold"
          >
            <Upload size={18} />
            Upload Document
          </Link>
        }
      />

      {/* Statistics Cards */}
      <div className="mt-6">
        <DocumentStatsCards />
      </div>

      {/* Documents Table */}
      <div className="mt-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <DocumentTable />
      </div>
    </div>
  );
}
