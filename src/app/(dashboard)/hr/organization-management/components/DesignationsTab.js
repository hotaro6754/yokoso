"use client";

import DesignationTableWrapper from "./DesignationTableWrapper";

export default function DesignationsTab({ viewOnly = false, allowFetch = true }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
        <DesignationTableWrapper viewOnly={viewOnly} allowFetch={allowFetch} />
      </div>
    </div>
  );
}
