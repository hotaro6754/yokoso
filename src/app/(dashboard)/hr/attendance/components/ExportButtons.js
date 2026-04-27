import { Download, Printer } from "lucide-react";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "../../reports-analytics/components/reportExport";

export default function ExportButtons({ columns, rows, fileNamePrefix }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() =>
          downloadCsv({
            columns,
            rows,
            fileName: `${fileNamePrefix}.csv`,
          })
        }
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <Download className="h-4 w-4" />
        CSV
      </button>
      <button
        onClick={() =>
          downloadExcel({
            columns,
            rows,
            fileName: `${fileNamePrefix}.xlsx`,
          })
        }
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <Download className="h-4 w-4" />
        Excel
      </button>
      {/* <button
        onClick={() => downloadPdf({ fileName: `${fileNamePrefix}.pdf` })}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <Printer className="h-4 w-4" />
        PDF / Print
      </button>
      <button
        onClick={printReport}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <Printer className="h-4 w-4" />
        Print
      </button> */}
    </div>
  );
}
