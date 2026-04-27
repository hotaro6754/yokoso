"use client";

import { useState, Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Upload, FileDown, Loader2, X, FileSpreadsheet, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import { employeeService } from "@/services/hr-services/employeeService";
import { salaryTemplateService } from "@/services/payroll-role-services/salary-templates.service";

export default function SalaryRevisionBulkUploadModal({ isOpen, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStats, setUploadStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [templates, setTemplates] = useState([]);
    const fileInputRef = useRef(null);

    const clearSelectedFile = () => {
        setFile(null);
        setUploadStats(null);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [empRes, tplRes] = await Promise.all([
                employeeService.getAllEmployees({ limit: 5000 }),
                salaryTemplateService.getTemplates()
            ]);
            setEmployees(empRes.data?.employees || empRes.data?.data || empRes.data || []);
            setTemplates(tplRes.data?.data || tplRes.data || []);
        } catch (error) {
            console.error("Failed to load dependency data for bulk upload", error);
        }
    };

    // Template Headers for Revisions
    const templateHeaders = [
        "employeeCode", 
        "effectiveDate", 
        "newAnnualCTC", 
        "salaryTemplateName", 
        "revisionReason", 
        "notes"
    ];

    const sampleData = [
        {
            employeeCode: "EMP001",
            effectiveDate: "2024-04-01",
            newAnnualCTC: 1200000,
            salaryTemplateName: "Standard Template", // Using name instead of ID
            revisionReason: "INCREMENT",
            notes: "Revised for FY 24-25"
        },
        {
            employeeCode: "EMP002",
            effectiveDate: "2024-04-01",
            newAnnualCTC: 850000,
            salaryTemplateName: "Standard Template",
            revisionReason: "PROMOTION",
            notes: "Promoted to Senior Engineer"
        }
    ];

    const exportTemplate = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(sampleData, { header: templateHeaders });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Salary Revisions");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "salary_revision_import_template.xlsx");
            toast.success("Template downloaded successfully");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to download template");
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
                toast.error("Please upload a valid Excel file (.xlsx or .xls)");
                e.target.value = "";
                return;
            }
            setFile(selectedFile);
            setUploadStats(null);
        }
    };

    const calculateNewStructure = async (annualCTC, templateId) => {
        try {
            const tplRes = await salaryTemplateService.getTemplateById(templateId);
            const template = tplRes.data?.data || tplRes.data;
            if (!template) return null;

            const ctc = parseFloat(annualCTC) || 0;
            const monthlyCTC = ctc / 12;

            const newStruct = {
                annualCTC: ctc,
                monthlyCTC: monthlyCTC,
                basicSalary: 0,
                hra: 0,
                pf: 0,
                pt: 0,
                tds: 0,
                specialAllowance: 0,
                conveyance: 0,
                medical: 0,
                otherAllowances: [],
                deductions: []
            };

            const components = [...(template.components || [])].sort((a, b) => {
                const nameA = (a.component?.name || "").toLowerCase();
                if (nameA.includes("basic")) return -1;
                return 1;
            });

            components.forEach((tc) => {
                const comp = tc.component;
                if (!comp) return;

                let value = tc.overrideValue !== null ? tc.overrideValue : comp.value;
                const calcType = tc.overrideCalculationType || comp.calculationType;
                const name = comp.name.toLowerCase();

                if (calcType === "PERCENTAGE_OF_CTC" && monthlyCTC > 0) {
                    value = Math.round((value / 100) * monthlyCTC);
                } else if (calcType === "PERCENTAGE_OF_BASIC" && newStruct.basicSalary > 0) {
                    value = Math.round((value / 100) * newStruct.basicSalary);
                }

                if (comp.maxAmount && value > comp.maxAmount) value = comp.maxAmount;
                if (comp.eligibilityThreshold && newStruct.basicSalary > comp.eligibilityThreshold) value = 0;

                if (name.includes("basic")) newStruct.basicSalary = value;
                else if (name === "hra") newStruct.hra = value;
                else if (name.includes("pf") && comp.type === "DEDUCTION") newStruct.pf = value;
                else if (name.includes("professional tax") || name === "pt") newStruct.pt = value;
                else if (name.includes("income tax") || name === "tds") newStruct.tds = value;
                else if (comp.type === "EARNING" && name !== "special allowance") newStruct.otherAllowances.push({ name: comp.name, amount: value });
                else if (comp.type === "DEDUCTION") newStruct.deductions.push({ name: comp.name, amount: value });
            });

            const esic = newStruct.basicSalary <= 21000 ? Math.ceil(newStruct.basicSalary * 0.04) : 0;
            if (esic > 0) newStruct.deductions.push({ name: "ESIC", amount: esic });

            const otherEarningsTotal = newStruct.otherAllowances.reduce((a, b) => a + b.amount, 0);
            const earningsTotal = newStruct.basicSalary + newStruct.hra + otherEarningsTotal;
            newStruct.specialAllowance = Math.max(0, Math.round(monthlyCTC - earningsTotal));

            return newStruct;
        } catch (e) {
            console.error("Calculation failed for row", e);
            return null;
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadStats(null);
        setUploadProgress(0);

        const formatDateForPayload = (val) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().split('T')[0];
            
            // Handle Excel serial dates if they somehow come as numbers
            if (typeof val === 'number') {
                const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                return date.toISOString().split('T')[0];
            }

            // Handle DD-MM-YYYY or DD/MM/YYYY
            const dateParts = val.toString().split(/[-/]/);
            if (dateParts.length === 3) {
                // Check if it's YYYY-MM-DD
                if (dateParts[0].length === 4) return val;
                // Otherwise assume DD-MM-YYYY
                const day = dateParts[0].padStart(2, '0');
                const month = dateParts[1].padStart(2, '0');
                const year = dateParts[2];
                return `${year}-${month}-${day}`;
            }

            return val;
        };

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { 
                        type: 'array',
                        cellDates: true,
                        dateNF: 'yyyy-mm-dd'
                    });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                    if (jsonData.length === 0) {
                        toast.error("The uploaded file is empty");
                        setIsUploading(false);
                        return;
                    }

                    // Pre-fetch all structures to find old structure for employees
                    const structuresRes = await payrollSalaryStructureService.getAllSalaryStructures({ limit: 5000 });
                    const allStructures = structuresRes.data?.salaryStructures || structuresRes.data?.data || structuresRes.data || [];

                    let successCount = 0;
                    let failureCount = 0;
                    const errorMessages = [];
                    const totalRows = jsonData.length;

                    for (let i = 0; i < totalRows; i++) {
                        const row = jsonData[i];
                        try {
                            const empCode = row.employeeCode || row["Employee Code"];
                            const rawDate = row.effectiveDate || row["Effective Date"];
                            const effectiveDate = formatDateForPayload(rawDate);
                            const newCTC = Number(row.newAnnualCTC || row["New Annual CTC"]);
                            const templateName = row.salaryTemplateName || row["Template Name"];
                            const reason = row.revisionReason || row["Reason"] || "INCREMENT";
                            const notes = row.notes || row["Notes"] || "";

                            if (!empCode || !effectiveDate || isNaN(newCTC)) {
                                throw new Error("Missing required fields (Employee Code, Date, or CTC)");
                            }

                            // Find employee
                            const employee = employees.find(e => 
                                (e.biometricId && e.biometricId.toString() === empCode.toString()) || 
                                (e.employeeId && e.employeeId.toString() === empCode.toString()) ||
                                (e.employee?.employeeId && e.employee.employeeId.toString() === empCode.toString())
                            );

                            if (!employee) throw new Error(`Employee ${empCode} not found`);

                            const employeeDbId = employee.employee?.id || employee.id;

                            // Find current structure
                            const currentStructure = allStructures.find(s => 
                                (s.employeeId === employeeDbId || s.employee?.id === employeeDbId) && s.status === 'ACTIVE'
                            ) || allStructures.find(s => 
                                (s.employeeId === employeeDbId || s.employee?.id === employeeDbId)
                            );

                            // Find Template ID by Name
                            let finalTemplateId = null;
                            if (templateName) {
                                const matchedTemplate = templates.find(t => 
                                    t.templateName?.toLowerCase().trim() === templateName.toString().toLowerCase().trim()
                                );
                                if (matchedTemplate) {
                                    finalTemplateId = matchedTemplate.id;
                                } else {
                                    throw new Error(`Template "${templateName}" not found`);
                                }
                            } else {
                                finalTemplateId = currentStructure?.salaryTemplateId;
                            }

                            if (!finalTemplateId) throw new Error("Salary template name not found in system and no current structure exists to fallback to");

                            const calculatedNewStructure = await calculateNewStructure(newCTC, finalTemplateId);
                            if (!calculatedNewStructure) throw new Error("Failed to calculate new structure breakdown");

                            const payload = {
                                employeeId: parseInt(employeeDbId),
                                salaryTemplateId: parseInt(finalTemplateId),
                                oldStructure: currentStructure || {},
                                newStructure: calculatedNewStructure,
                                effectiveDate: effectiveDate,
                                revisionReason: reason,
                                notes: notes,
                                status: 'PENDING_APPROVAL' 
                            };

                            await payrollSalaryStructureService.createRevision(payload);
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
                        toast.success(`Successfully uploaded ${successCount} revisions`);
                        if (onImportSuccess) onImportSuccess();
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

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                                {isUploading && (
                                    <div className="absolute inset-0 z-50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                        <div className="flex flex-col items-center gap-4 w-full px-8">
                                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                                            <div className="text-center w-full">
                                                <h4 className="text-lg font-bold">Processing Revisions</h4>
                                                <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                                                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">{uploadProgress}% complete</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-bold flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary-500" />
                                        Bulk Upload Revisions
                                    </Dialog.Title>
                                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                                        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                            <FileDown className="w-4 h-4" /> Export Template
                                        </h4>
                                        <p className="text-xs text-gray-600 mb-4">Download Excel template for revisions.</p>
                                        <button onClick={exportTemplate} className="w-full py-2 bg-white border border-primary-200 rounded-lg text-xs font-medium text-primary-700 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                                            <FileSpreadsheet className="w-4 h-4 text-green-500" /> Download Template
                                        </button>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center relative hover:border-primary-300 transition-colors">
                                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" />
                                        <div className="flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">{file ? file.name : "Select Excel file"}</p>
                                                {file && (
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
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase">.XLSX, .XLS supported</p>
                                        </div>
                                    </div>

                                    {uploadStats && (
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-green-600 uppercase">Success: {uploadStats.success}</span>
                                                <span className="text-red-600 uppercase">Failed: {uploadStats.failed}</span>
                                            </div>
                                            {uploadStats.errors?.length > 0 && (
                                                <div className="mt-2 p-2 bg-white rounded border border-red-100 max-h-24 overflow-y-auto">
                                                    <p className="text-[10px] font-bold text-red-500 mb-1 uppercase tracking-wider">Errors</p>
                                                    {uploadStats.errors.map((err, i) => (
                                                        <p key={i} className="text-[10px] text-gray-500 border-b last:border-0 py-1 italic">{err}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || isUploading}
                                        className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all"
                                    >
                                        Start Import
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
