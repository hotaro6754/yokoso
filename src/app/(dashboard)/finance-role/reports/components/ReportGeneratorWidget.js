"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, Download, Loader2, Filter } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ReportGeneratorWidget({ selectedReportType, onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportType: selectedReportType || "financial-summary",
    dateRange: "this-month",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    format: "pdf",
    includeCharts: true,
  });

  useEffect(() => {
    if (selectedReportType) {
      setFormData((prev) => ({ ...prev, reportType: selectedReportType }));
    }
  }, [selectedReportType]);

  const dateRanges = [
    { id: "this-month", label: "This Month" },
    { id: "last-month", label: "Last Month" },
    { id: "this-quarter", label: "This Quarter" },
    { id: "last-quarter", label: "Last Quarter" },
    { id: "this-year", label: "This Year" },
    { id: "custom", label: "Custom Range" },
  ];

  const formats = [
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "excel", label: "Excel", icon: FileText },
    { id: "csv", label: "CSV", icon: FileText },
  ];

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const payload = {
        reportType: formData.reportType,
        dateRange: formData.dateRange,
        startDate: formData.dateRange === "custom" ? formData.startDate : undefined,
        endDate: formData.dateRange === "custom" ? formData.endDate : undefined,
        format: formData.format,
        includeCharts: formData.includeCharts
      };
      await apiClient.post("/finance-role/reports", payload);
      toast.success("Report generated successfully");
      if (onGenerated) {
        onGenerated();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 premium-shadow h-full"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10"
        >
          <Filter className="w-6 h-6" />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Generate Report</h3>
          <p className="text-sm text-muted-foreground">Configure and generate</p>
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* Report Type */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Report Type
          </label>
          <select
            value={formData.reportType}
            onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="financial-summary">Financial Summary</option>
            <option value="expense-report">Expense Report</option>
            <option value="payroll-report">Payroll Report</option>
            <option value="tax-report">Tax Report</option>
            <option value="department-wise">Department Analysis</option>
            <option value="cost-center">Cost Center Report</option>
            <option value="monthly-report">Monthly Report</option>
            <option value="employee-wise">Employee Financial</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Date Range
          </label>
          <select
            value={formData.dateRange}
            onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {dateRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {formData.dateRange === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* File Format */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            File Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {formats.map((format) => {
              const FormatIcon = format.icon;
              return (
                <motion.button
                  key={format.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, format: format.id })}
                  className={`p-3 rounded-lg text-xs font-semibold transition-all ${formData.format === format.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                >
                  <FormatIcon className="w-4 h-4 mx-auto mb-1" />
                  {format.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Include Charts */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <input
            type="checkbox"
            id="includeCharts"
            checked={formData.includeCharts}
            onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="includeCharts" className="text-sm font-semibold text-foreground cursor-pointer">
            Include Charts & Visualizations
          </label>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate Report
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
