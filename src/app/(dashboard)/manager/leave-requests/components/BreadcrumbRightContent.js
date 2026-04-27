"use client";

import { Calendar, Download } from "lucide-react";
import Flatpickr from "react-flatpickr";
import ManagerLeaveService from "@/services/manager/leave-requests.service";
import { toast } from "react-hot-toast";
import { useState } from "react";

const BreadcrumbRightContent = ({ selectedDate, setSelectedDate }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await ManagerLeaveService.exportLeaveRequests();
      toast.success("Excel sheet downloaded successfully!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error(error.message || "Failed to export leave requests");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-auto">
        <Flatpickr
          value={selectedDate}
          onChange={(date) => setSelectedDate(date[0])}
          options={{
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d-m-Y",
            allowInput: true,
            clickOpens: true,
            static: true,
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Calendar
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        <Download size={18} />
        {exporting ? "Exporting..." : "Export"}
      </button>
    </div>
  );
};

export default BreadcrumbRightContent;
