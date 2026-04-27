"use client";
import { useState } from 'react';
import { FileText, Download, Loader2, Bookmark, Save } from 'lucide-react';
import { leaveReportsService } from '@/services/hr-services/leaveReports.service';

const LeaveReportsHeader = ({ filters, onReportSaved }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await leaveReportsService.exportReport(filters);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    const reportName = prompt('Enter a name for this report:');
    if (!reportName) return;

    try {
      setIsSaving(true);
      await leaveReportsService.saveReport({
        name: reportName,
        filters: filters
      });
      alert('Report saved successfully!');
      if (onReportSaved) onReportSaved();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save report: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div className="flex items-center gap-3 mt-4 sm:mt-0">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Report'}
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {isExporting ? 'Exporting...' : 'Export Report'}
        </button>
      </div>
    </div>
  );
};

export default LeaveReportsHeader;