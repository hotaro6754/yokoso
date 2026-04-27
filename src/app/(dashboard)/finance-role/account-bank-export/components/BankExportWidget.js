"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";
import DatePicker from "@/components/common/DatePicker";

export default function BankExportWidget({ onExportGenerated }) {
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [exportData, setExportData] = useState({
    bankAccountId: "",
    exportType: "payroll",
    format: "csv",
    date: new Date().toISOString().split("T")[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const loadExportSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/finance-role/account-bank-export/exports/summary");
      setData(response.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load export summary");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const response = await apiClient.get("/finance-role/account-bank-export/bank-accounts");
      setAccounts(response.data?.data?.accounts || []);
    } catch (err) {
      setAccounts([]);
    }
  }, []);

  useEffect(() => {
    loadExportSummary();
    loadAccounts();
  }, [loadExportSummary, loadAccounts]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const downloadExportFile = async (exportItem) => {
    const response = await apiClient.get(
      `/finance-role/account-bank-export/exports/${exportItem.id}/download`,
      { responseType: "blob" }
    );
    const contentType = response.headers?.["content-type"] || "application/octet-stream";
    const blob =
      response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);
    const contentDisposition = response.headers?.["content-disposition"] || "";
    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    const fallbackName = exportItem.fileName || `bank-export-${exportItem.id}`;
    const downloadName = fileNameMatch?.[1] || fallbackName;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleGenerateExport = async () => {
    try {
      setIsGenerating(true);
      setGenerateError("");
      const payload = {
        exportType: exportData.exportType,
        format: exportData.format,
        exportDate: exportData.date,
        bankAccountId: exportData.bankAccountId || undefined,
      };
      const response = await apiClient.post(
        "/finance-role/account-bank-export/exports",
        payload
      );
      const exportRecord = response.data?.data || null;
      await loadExportSummary();
      if (onExportGenerated) {
        onExportGenerated();
      }
      if (exportRecord?.id) {
        await downloadExportFile(exportRecord);
        toast.success("Export generated and downloaded");
      } else {
        toast.success(response.data?.message || "Export file generated successfully!");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to generate export file";
      setGenerateError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="glass-card glass-card-hover rounded-2xl p-6 h-full premium-shadow premium-shadow-hover relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-primary/10"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-6 relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10"
        >
          <Download className="w-6 h-6" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">Generate Bank Export</h3>
          <p className="text-sm text-muted-foreground">Create export files for bank transfers</p>
        </div>
      </motion.div>

      <div className="space-y-4 relative z-10">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Export Form */}
        <div className="space-y-4">
          {/* Bank Account */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Bank Account
            </label>
            <select
              value={exportData.bankAccountId}
              onChange={(e) =>
                setExportData({ ...exportData, bankAccountId: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Default bank account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} • {account.accountNumberMasked || account.accountNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Export Type */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Export Type
            </label>
            <select
              value={exportData.exportType}
              onChange={(e) =>
                setExportData({ ...exportData, exportType: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {data.exportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Format */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              File Format
            </label>
            <div className="flex gap-2">
              {data.exportFormats.map((format) => {
                const formatValue = format.toLowerCase() === "excel" ? "xlsx" : format.toLowerCase();
                return (
                  <motion.button
                    key={format}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setExportData({ ...exportData, format: formatValue })
                    }
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${exportData.format === formatValue
                      ? "bg-primary text-white shadow-lg"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                  >
                    {format}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Export Date — uses the same shared DatePicker as all other modules */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Export Date
            </label>
            <DatePicker
              name="exportDate"
              value={exportData.date}
              onChange={(e) => setExportData({ ...exportData, date: e.target.value })}
              placeholder="dd-mm-yyyy"
              dateFormat="d-m-Y"
            />
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateExport}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Generate Export File
              </>
            )}
          </motion.button>
          {generateError && (
            <p className="text-sm text-destructive">{generateError}</p>
          )}
        </div>

        {/* Last Export Info */}
        {data.lastExport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4 border-t border-border"
          >
            <p className="text-xs font-semibold text-muted-foreground mb-3">Last Export</p>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {data.lastExport.fileName}
                  </span>
                </div>
                {data.lastExport.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">
                    {formatDate(data.lastExport.date)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Records</p>
                  <p className="font-semibold text-foreground">{data.lastExport.records}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account</p>
                  <p className="font-semibold text-foreground">{data.lastExport.account}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(data.lastExport.amount)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
