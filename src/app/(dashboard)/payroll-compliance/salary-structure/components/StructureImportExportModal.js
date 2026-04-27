"use client";

import { useState, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Upload, FileDown, Loader2, X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";

export default function StructureImportExportModal({ isOpen, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStats, setUploadStats] = useState(null);
    const fileInputRef = useRef(null);

    const clearSelectedFile = () => {
        setFile(null);
        setUploadStats(null);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Template Data Structure - Based on real salary structure fields
    const templateHeaders = [
        "employeeId", "effectiveDate", "basicSalary",
        "hra", "conveyance", "medical", "specialAllowance", "pf", "pt", "tds",
        "otherAllowances", "deductions", "frequency", "notes"
    ];

    const sampleData = [
        {
            employeeId: "EMP001",
            effectiveDate: "2024-04-01",
            basicSalary: 50000,
            hra: 25000,
            conveyance: 1600,
            medical: 1250,
            specialAllowance: 10000,
            pf: 1800,
            pt: 200,
            tds: 500,
            otherAllowances: '{"Internet": 1000, "Phone": 500}', // JSON string for flexibility
            deductions: '{"Canteen": 500}',
            frequency: "MONTHLY",
            notes: "Revised structure for Q2"
        },
        {
            employeeId: "EMP002",
            effectiveDate: "2024-05-01",
            basicSalary: 30000,
            hra: 15000,
            conveyance: 1600,
            medical: 1250,
            specialAllowance: 5000,
            pf: 1800,
            pt: 200,
            tds: 0,
            otherAllowances: "",
            deductions: "",
            frequency: "MONTHLY",
            notes: "New joiner structure"
        }
    ];

    const exportTemplate = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(sampleData, { header: templateHeaders });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Salary Structures");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "salary_structure_import_template.xlsx");
            toast.success("Template downloaded successfully");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to download template");
        }
    };

    const handleExportAll = async () => {
        try {
            setIsUploading(true);
            // Fetch all structures with a large limit
            const response = await payrollSalaryStructureService.getAllSalaryStructures({ limit: 10000 });
            const structures = response.data?.salaryStructures || response.data?.data || response.data || [];

            if (!structures || structures.length === 0) {
                toast.error("No salary structures found to export");
                return;
            }

            // Flatten and format data for export
            const exportData = structures.map(struct => {
                // Parse components if needed or extract from direct fields
                // The service returns the direct fields on the structure object

                // Helper to safely parse JSON or return string
                const formatJsonField = (field) => {
                    if (!field) return "";
                    if (typeof field === 'object') return JSON.stringify(field);
                    return field;
                };

                return {
                    "Employee ID": struct.employee?.employeeId || struct.employee_id || "",
                    "Employee Name": struct.employee ? `${struct.employee.firstName} ${struct.employee.lastName}` : "",
                    "Effective Date": struct.effectiveDate ? new Date(struct.effectiveDate).toISOString().split('T')[0] : "",
                    "ANNUAL BASE CTC": struct.basicSalary,
                    "HRA": struct.hra,
                    "Conveyance": struct.conveyance,
                    "Medical": struct.medical,
                    "Special Allowance": struct.specialAllowance,
                    "PF": struct.pf,
                    "PT": struct.pt,
                    "TDS": struct.tds,
                    "ESIC": struct.esic,
                    "Total CTC": struct.totalCTC,
                    "Other Allowances": formatJsonField(struct.otherAllowances),
                    "Deductions": formatJsonField(struct.deductions),
                    "Frequency": struct.frequency,
                    "Status": struct.status,
                    "Notes": struct.notes || ""
                };
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "All Salary Structures");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });

            const timestamp = new Date().toISOString().split('T')[0];
            saveAs(data, `salary_structures_export_${timestamp}.xlsx`);
            toast.success(`Successfully exported ${structures.length} structures`);

        } catch (error) {
            console.error("Export all failed:", error);
            toast.error("Failed to export data: " + (error.message || "Unknown error"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx')) {
                toast.error("Please upload a valid Excel file (.xlsx)");
                e.target.value = "";
                return;
            }
            setFile(selectedFile);
            setUploadStats(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadStats(null);
        setUploadProgress(0);

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        toast.error("The uploaded file is empty");
                        setIsUploading(false);
                        return;
                    }

                    let successCount = 0;
                    let failureCount = 0;
                    const errorMessages = [];
                    const totalRows = jsonData.length;

                    for (let i = 0; i < totalRows; i++) {
                        const row = jsonData[i];

                        try {
                            // Parse JSON fields if they are strings
                            let otherAllowances = row.otherAllowances;
                            let deductions = row.deductions;

                            try {
                                if (typeof otherAllowances === 'string' && otherAllowances.trim()) {
                                    otherAllowances = JSON.parse(otherAllowances);
                                }
                            } catch (e) {
                                // Keep as is or ignore if invalid JSON
                                console.warn("Failed to parse otherAllowances JSON", e);
                            }

                            try {
                                if (typeof deductions === 'string' && deductions.trim()) {
                                    deductions = JSON.parse(deductions);
                                }
                            } catch (e) {
                                console.warn("Failed to parse deductions JSON", e);
                            }

                            // Prepare payload
                            // Prepare payload
                            const rawEmployeeId = row.employeeId || row["Employee ID"];
                            const rawEffectiveDate = row.effectiveDate || row["Effective Date"];
                            const rawBasic = row.basicSalary || row["Basic Salary"] || row["ANNUAL BASE CTC"];
                            const rawHra = row.hra || row["HRA"];
                            const rawConveyance = row.conveyance || row["Conveyance"];
                            const rawMedical = row.medical || row["Medical"];
                            const rawSpecial = row.specialAllowance || row["Special Allowance"];
                            const rawPf = row.pf || row["PF"];
                            const rawPt = row.pt || row["PT"];
                            const rawTds = row.tds || row["TDS"];
                            const rawEsic = row.esic || row["ESIC"];
                            const rawFrequency = row.frequency || row["Frequency"];
                            const rawNotes = row.notes || row["Notes"];
                            const rawOtherAllowances = row.otherAllowances || row["Other Allowances"];
                            const rawDeductions = row.deductions || row["Deductions"];

                            const payload = {
                                employeeId: rawEmployeeId,
                                effectiveDate: rawEffectiveDate,
                                basicSalary: Number(rawBasic) || 0,
                                hra: Number(rawHra) || 0,
                                conveyance: Number(rawConveyance) || 0,
                                medical: Number(rawMedical) || 0,
                                specialAllowance: Number(rawSpecial) || 0,
                                pf: Number(rawPf) || 0,
                                pt: Number(rawPt) || 0,
                                tds: Number(rawTds) || 0,
                                otherAllowances: typeof rawOtherAllowances === 'string' ? JSON.parse(rawOtherAllowances || '{}') : (rawOtherAllowances || {}),
                                deductions: typeof rawDeductions === 'string' ? JSON.parse(rawDeductions || '{}') : (rawDeductions || {}),
                                frequency: rawFrequency || "MONTHLY",
                                notes: rawNotes,
                            };

                            // Remove companyId as backend handles it from token
                            // delete payload.companyId; 

                            // Handle Employee ID (convert to Int if numeric, else send as employeeCode)
                            const empIdVal = payload.employeeId;
                            if (empIdVal && !isNaN(Number(empIdVal))) {
                                payload.employeeId = Number(empIdVal);
                            } else if (empIdVal) {
                                // It is a string code (e.g., EMP001)
                                payload.employeeCode = empIdVal;
                                delete payload.employeeId;
                            }


                            // IMPORTANT: The service requires companyId. In the frontend, we don't usually pass companyId manually, 
                            // the token handles it on the backend via the `req.user.companyId`. 
                            // BUT `payrollSalaryStructureService.createSalaryStructure` calls `apiClient.post` which sends the token.
                            // The backend controller extracts companyId. So we DON'T need to send it in the payload usually.
                            // Let's remove `companyId` from payload if the backend controller handles it.
                            delete payload.companyId;

                            // We need to handle the `employeeId`. 
                            // If the Excel contains "EMP001", and the backend expects an Integer ID (101), this will fail.
                            // To make this robust, we would ideally search for the employee by code.
                            // However, we can't do that easily inside this loop without spamming the API.
                            // A better approach is: User exports data -> get IDs -> Modify -> Import.
                            // Or: The backend `createSalaryStructure` should support lookup.
                            // Since I can't modify the backend massively right now, I'll proceed with direct mapping.
                            // If `employeeId` is numeric, parseInt it.
                            if (!isNaN(parseInt(row.employeeId))) {
                                payload.employeeId = parseInt(row.employeeId);
                            }

                            await payrollSalaryStructureService.createSalaryStructure(payload);
                            successCount++;

                        } catch (err) {
                            failureCount++;
                            errorMessages.push(`Row ${i + 2}: ${err.message || "Unknown error"}`);
                        }

                        setUploadProgress(Math.round(((i + 1) / totalRows) * 100));
                    }

                    setUploadStats({
                        total: totalRows,
                        success: successCount,
                        failed: failureCount,
                        errors: errorMessages
                    });

                    if (successCount > 0) {
                        toast.success(`Successfully imported ${successCount} records`);
                        if (onImportSuccess) onImportSuccess();
                    }

                    if (failureCount > 0) {
                        toast.error(`Failed to import ${failureCount} records`);
                    }

                } catch (error) {
                    console.error("File processing error:", error);
                    toast.error("Failed to process file");
                } finally {
                    setIsUploading(false);
                    setFile(null);
                }
            };

            reader.readAsArrayBuffer(file);

        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Upload failed");
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            clearSelectedFile();
            onClose();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all relative">
                                {/* Upload Indicator Overlay */}
                                {isUploading && (
                                    <div className="absolute inset-0 z-50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-200">
                                        <div className="flex flex-col items-center gap-4 w-full px-8">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-brand-100 dark:border-brand-500/10 rounded-full" />
                                                <div className="absolute inset-0 w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Upload className="w-6 h-6 text-brand-500 animate-bounce" />
                                                </div>
                                            </div>
                                            <div className="text-center w-full">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Processing Data</h4>
                                                <div className="mt-4 space-y-2">
                                                    <div className="flex justify-between text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                                                        <span>Progress</span>
                                                        <span>{uploadProgress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand-500 transition-all duration-500 ease-out"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                                                        Please do not close this window or refresh the page
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-5 h-5 text-brand-500" />
                                        Import / Export Structures
                                    </Dialog.Title>
                                    <button
                                        onClick={handleClose}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Export Section */}
                                    <div className="bg-brand-50/50 dark:bg-brand-500/5 p-4 rounded-xl border border-brand-100 dark:border-brand-500/10 mb-6">
                                        <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-300 mb-1 flex items-center gap-2">
                                            <FileDown className="w-4 h-4" />
                                            Export
                                        </h4>
                                        <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mb-4">
                                            Download templates or export all salary structures.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={exportTemplate}
                                                className="py-2.5 px-3 bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-500/20 
                                 rounded-lg text-xs font-medium text-brand-700 dark:text-brand-400 
                                 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <FileSpreadsheet className="w-4 h-4 text-green-500" />
                                                Download Template
                                            </button>
                                            <button
                                                onClick={handleExportAll}
                                                disabled={isUploading}
                                                className="py-2.5 px-3 bg-brand-500 dark:bg-brand-600 border border-transparent
                                 rounded-lg text-xs font-medium text-white
                                 hover:bg-brand-600 dark:hover:bg-brand-500 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                                Export All Data
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-gray-100 dark:border-gray-700" />
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                            <span className="bg-white dark:bg-gray-800 px-3 text-gray-400">Upload Data</span>
                                        </div>
                                    </div>

                                    {/* Import Section */}
                                    <div className="space-y-4">
                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all group
                        ${file
                                                    ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-500/5'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx, .xls"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                disabled={isUploading}
                                                id="import-structure-file"
                                            />
                                            {file ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                                                        <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[220px]">
                                                            {file.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (!isUploading) clearSelectedFile();
                                                            }}
                                                            disabled={isUploading}
                                                            className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            title="Remove selected file"
                                                            aria-label="Remove selected file"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Drag & drop or <span className="text-brand-500 font-bold underline">browse</span>
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                                                        Only .xlsx files supported (Max 5MB)
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {uploadStats && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">Processing Summary</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">{uploadStats.success + uploadStats.failed} / {uploadStats.total}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden flex">
                                                    <div
                                                        className="bg-emerald-500 h-full"
                                                        style={{ width: `${(uploadStats.success / uploadStats.total) * 100}%` }}
                                                    />
                                                    <div
                                                        className="bg-rose-500 h-full"
                                                        style={{ width: `${(uploadStats.failed / uploadStats.total) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                                                        <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Success</p>
                                                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{uploadStats.success}</p>
                                                    </div>
                                                    <div className="text-center p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10">
                                                        <p className="text-[10px] text-rose-600 uppercase font-bold tracking-wider">Failed</p>
                                                        <p className="text-lg font-bold text-rose-700 dark:text-rose-400">{uploadStats.failed}</p>
                                                    </div>
                                                </div>

                                                {uploadStats.errors?.length > 0 && (
                                                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-rose-100 dark:border-rose-500/20 max-h-32 overflow-y-auto">
                                                        <p className="text-[10px] font-bold text-rose-500 uppercase mb-2">Error Log</p>
                                                        <ul className="space-y-1.5">
                                                            {uploadStats.errors.map((err, i) => (
                                                                <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-1.5 italic">
                                                                    <span className="text-rose-400">•</span>
                                                                    {err}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleUpload}
                                            disabled={!file || isUploading}
                                            className="w-full py-2.5 px-4 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 
                               text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {isUploading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Processing ({uploadProgress}%)
                                                </span>
                                            ) : (
                                                "Start Import"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
