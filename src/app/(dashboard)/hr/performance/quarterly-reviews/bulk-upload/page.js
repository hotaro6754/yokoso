"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Upload, FileDown, ArrowLeft, CheckCircle2, Clock, X } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";

const TEMPLATE_HEADERS = ["Name", "Description"];
const SAMPLE_ROWS = [
  ["Customer Satisfaction", "Improve CSAT score to 4.5+ by end of quarter"],
  ["Process Efficiency", "Reduce approval turnaround time by 20%"],
];

const downloadTemplate = () => {
  const rows = [TEMPLATE_HEADERS, ...SAMPLE_ROWS];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "kpi_kra_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("Template downloaded");
};

const normalizeKey = (key) =>
  String(key || "")
    .toLowerCase()
    .replace(/[\s_]+/g, "");

const parseRowsToPayload = (rows) => {
  const nameKeys = ["name", "kpi", "kra", "title", "goal"];
  const descKeys = ["description", "desc", "details", "summary"];

  const normalizedRows = rows.map((row) => {
    const normalized = {};
    Object.entries(row || {}).forEach(([k, v]) => {
      normalized[normalizeKey(k)] = v;
    });
    return normalized;
  });

  let payload = normalizedRows
    .map((row) => {
      const name = nameKeys.map((k) => row[k]).find((v) => v) || "";
      const description = descKeys.map((k) => row[k]).find((v) => v) || "";
      return { name: String(name).trim(), description: String(description).trim() };
    })
    .filter((row) => row.name && row.description);

  return payload;
};

const detectDelimiter = (line) => {
  const comma = (line.match(/,/g) || []).length;
  const semicolon = (line.match(/;/g) || []).length;
  const tab = (line.match(/\t/g) || []).length;
  if (semicolon >= comma && semicolon >= tab) return ";";
  if (tab >= comma && tab >= semicolon) return "\t";
  return ",";
};

const parseCsvLine = (line, delimiter) => {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
};

export default function KRABulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [view, setView] = useState("selection"); // selection | uploading | results
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const clearSelectedFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.match(/\.(csv|xlsx|xls|json)$/i)) {
      toast.error("Please upload CSV, Excel, or JSON file");
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const processFile = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setView("uploading");
    setUploadProgress(10);

    try {
      let rows = [];

      if (file.name.endsWith(".json")) {
        const text = await file.text();
        rows = JSON.parse(text);
      } else if (file.name.match(/\.(xlsx|xls)$/i)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { raw: true });
      } else {
        const text = await file.text();
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const headerLine = (lines[0] || "").replace(/^\uFEFF/, "");
        const delimiter = detectDelimiter(headerLine);
        const headers = parseCsvLine(headerLine, delimiter).map((h) => h.trim());
        rows = lines.slice(1).map((line) => {
          const values = parseCsvLine(line, delimiter);
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i]?.trim();
            return obj;
          }, {});
        });
      }

      setUploadProgress(40);
      if (!Array.isArray(rows) || rows.length === 0) {
        toast.error("Template has no data rows. Please fill at least one KPI/KRA.");
        setView("selection");
        return;
      }
      let payload = parseRowsToPayload(Array.isArray(rows) ? rows : []);

      if (payload.length === 0 && Array.isArray(rows)) {
        const fallback = rows
          .map((row) => {
            const values = Object.values(row || {});
            return {
              name: String(values[0] || "").trim(),
              description: String(values[1] || "").trim(),
            };
          })
          .filter((row) => row.name && row.description);
        payload = fallback;
      }

      if (payload.length === 0) {
        toast.error("No valid KPI/KRA rows found. Use Name/Description columns and fill at least one row.");
        setView("selection");
        return;
      }

      setUploadProgress(70);
      await performanceManagementService.bulkUploadKpis(payload);
      setUploadProgress(100);

      setResults({
        total: payload.length,
        success: payload.length,
        failed: 0,
      });

      try {
        const cachePayload = payload.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          uploadedAt: new Date().toISOString(),
        }));
        window.localStorage.setItem("zodeck_kra_upload_cache", JSON.stringify(cachePayload));
      } catch (error) {
        console.warn("Failed to cache KPI/KRA upload", error);
      }

      toast.success("Uploaded successfully");
      setView("results");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Upload failed");
      setView("selection");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
        <Breadcrumb
          rightContent={
            <button
              onClick={() => router.push("/hr/performance/quarterly-reviews")}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Quarterly Reviews
            </button>
          }
        />

        {view === "selection" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Bulk KRA/KPI Upload
              </h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Download the template, fill in your KRAs/KPIs, then upload the file for import.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="h-12 w-12 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center mb-6">
                  <FileDown className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Download Template</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 flex-1">
                  Use the template with Name and Description columns for KRAs/KPIs.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="w-full py-3.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  Download (.csv)
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Upload className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Upload File</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 flex-1">
                  Upload CSV, Excel, or JSON file. We'll import all valid rows.
                </p>

                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all group h-[58px] flex items-center justify-center
                    ${file ? "border-emerald-400 bg-emerald-50/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-500 hover:bg-brand-50/5"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-2 truncate px-2">
                    {file ? (
                      <>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={(evt) => {
                            evt.preventDefault();
                            evt.stopPropagation();
                            clearSelectedFile();
                          }}
                          className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                          title="Remove selected file"
                          aria-label="Remove selected file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">Select file</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={processFile}
                  disabled={!file}
                  className="mt-4 w-full py-3.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Start Data Import
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "uploading" && (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-in zoom-in duration-300">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-8 border-brand-50 dark:border-brand-500/10 rounded-full" />
              <div
                className="absolute inset-0 w-24 h-24 border-8 border-brand-500 border-t-transparent rounded-full animate-spin"
                style={{ animationDuration: "0.8s" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="w-8 h-8 text-brand-500 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Importing Data...</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Processing your file. Please do not refresh or close this page.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-black text-brand-600 dark:text-brand-400 tracking-tighter">
                <span>PROGRESS</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-4 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-gray-200 dark:ring-gray-700">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {view === "results" && results && (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
            <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Complete</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Imported {results.success} of {results.total} records successfully.
            </p>
            <button
              onClick={() => router.push("/hr/performance/quarterly-reviews")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-sm hover:bg-brand-700 transition-colors shadow-sm"
            >
              Back to Quarterly Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
