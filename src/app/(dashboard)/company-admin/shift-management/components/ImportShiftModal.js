"use client";

import { useState, Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Upload, FileDown, Loader2, X, FileSpreadsheet, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "react-hot-toast";
import { shiftManagementService } from "@/services/manager-services/shiftManagement.service";
import { employeeService } from "@/services/hr-services/employeeService";

export default function ImportShiftModal({ isOpen, onClose, onImportSuccess, teamMembers: propTeamMembers }) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStats, setUploadStats] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const fileInputRef = useRef(null);

    const clearSelectedFile = () => {
        setFile(null);
        setUploadStats(null);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Use prop teamMembers if available, otherwise fall back to local state
    useEffect(() => {
            // Only fetch if no prop data and modal is open
            const fetchTeam = async () => {
                try {
                    const teamRes = await employeeService.getAllEmployees();
                    const members = teamRes?.data || teamRes || [];
                    setTeamMembers(members);
                } catch (error) {
                    console.error("Failed to fetch team for import mapping", error);
                }
            };
            fetchTeam();
    }, [propTeamMembers, isOpen]);

    // Template Headers
    const templateHeaders = ["Employee ID", "Date", "Shift Code", "Location"];

    // Shift Mapping
    const shiftMap = {
        "S1": "Morning",
        "S2": "Afternoon",
        "S3": "Night",
        "G": "General"
    };

    const sampleData = [
        { "Employee ID": "EMP001", "Date": "2023-11-01", "Shift Code": "S1", "Location": "Office" },
        { "Employee ID": "EMP002", "Date": "2023-11-01", "Shift Code": "S2", "Location": "Remote" }
    ];

    const exportTemplate = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(sampleData, { header: templateHeaders });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Roster Template");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "shift_roster_template.xlsx");
            toast.success("Template downloaded successfully");
        } catch (error) {
            toast.error("Failed to download template");
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileName = selectedFile.name.toLowerCase();
            if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.csv') && !fileName.endsWith('.xls')) {
                toast.error("Please upload a valid Excel or CSV file");
                e.target.value = "";
                return;
            }
            setFile(selectedFile);
            setUploadStats(null);
        }
    };

    const processImport = async () => {
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });

                if (jsonData.length === 0) {
                    toast.error("File is empty");
                    setIsUploading(false);
                    return;
                }

                const validAssignments = [];
                const errors = [];
                const employeesHash = {};

                jsonData.forEach((row, index) => {
                    const empIdStr = row["Employee ID"]?.toString().trim();
                    const shiftCode = row["Shift Code"]?.toString().trim();
                    const date = row["Date"];
                    
                    if(!empIdStr || !date || !shiftCode) {
                         errors.push(`Row ${index + 2}: Missing ID, Date or Shift Code`);
                         return;
                    }

                    // Resolve Employee ID to Database ID
                    const member = teamMembers.find(m => 
                        m.employeeId === empIdStr || 
                        m.employeeCode === empIdStr || 
                        m.id && m.id.toString() === empIdStr ||
                        (m._id && m._id.toString() === empIdStr)
                    );

                    if (!member) {
                        errors.push(`Row ${index + 2}: Employee ${empIdStr} not found in employees list`);
                        return;
                    }

                    const dbId = member.id || member._id;

                    // Overlap Check
                    const key = `${dbId}-${date}`;
                    if (employeesHash[key]) {
                        errors.push(`Row ${index + 2}: Duplicate entry for ${empIdStr} on ${date}`);
                        return;
                    }
                    employeesHash[key] = true;

                    validAssignments.push({
                        employeeId: dbId,
                        shift: shiftMap[shiftCode] || shiftCode,
                        date: date,
                        location: row["Location"] || "Office"
                    });
                });

                if (validAssignments.length === 0) {
                     setUploadStats({
                        total: jsonData.length,
                        success: 0,
                        failed: jsonData.length,
                        errors: errors
                     });
                     setIsUploading(false);
                     toast.error("Validation failed. See details.");
                     return;
                }

                // Simulate API Call
                setUploadProgress(50);
                
                // CRITICAL: Explicitly map the Excel header keys to the camelCase keys expected by backend
                // This ensures we don't rely on the backend fail-safe mapping
                const finalPayload = validAssignments.map(row => ({
                    employeeId: row.employeeId || row["Employee ID"],
                    shift: row.shift || row["Shift Code"],
                    date: row.date || row["Date"],
                    location: row.location || row["Location"]
                }));
                
                const result = await shiftManagementService.importMonthlyRoster(finalPayload);
                setUploadProgress(100);

                const successfulCount = result.data?.successful || 0;
                const failedCount = (result.data?.failed || 0) + (jsonData.length - validAssignments.length);

                setUploadStats({
                    total: jsonData.length,
                    success: successfulCount,
                    failed: failedCount,
                    errors: [...errors, ...(result.data?.results?.filter(r => !r.success).map(r => r.error) || [])] 
                });

                if (successfulCount > 0) {
                    toast.success(`Successfully assigned ${successfulCount} shifts`);
                    if (onImportSuccess) setTimeout(onImportSuccess, 1000);
                }

            } catch (error) {
                toast.error("Import failed: " + error.message);
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleClose = () => {
        if (isUploading) return;
        clearSelectedFile();
        onClose();
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
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-brand-500" />
                                        Import Monthly Roster
                                    </Dialog.Title>
                                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-brand-50/50 dark:bg-brand-500/5 p-4 rounded-xl border border-brand-100 dark:border-brand-500/10 mb-6">
                                        <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-300 mb-1 flex items-center gap-2">
                                            <FileDown className="w-4 h-4" /> Template
                                        </h4>
                                        <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mb-4">
                                            Download the standard roster template.
                                        </p>
                                        <button
                                            onClick={exportTemplate}
                                            className="w-full py-2 px-3 bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-500/20 rounded-lg text-xs font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-green-500" /> Download .xlsx
                                        </button>
                                    </div>

                                    <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all group ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-200 hover:border-brand-300 dark:border-gray-700'}`}>
                                         <input ref={fileInputRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" disabled={isUploading} />
                                         {file ? (
                                             <div className="flex flex-col items-center relative z-10">
                                                 <button
                                                     type="button"
                                                     onClick={(e) => {
                                                         e.preventDefault();
                                                         e.stopPropagation();
                                                         if (!isUploading) clearSelectedFile();
                                                     }}
                                                     disabled={isUploading}
                                                     className="absolute -top-4 -right-4 p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                     title="Remove selected file"
                                                     aria-label="Remove selected file"
                                                 >
                                                     <X className="w-4 h-4" />
                                                 </button>
                                                 <FileSpreadsheet className="w-8 h-8 text-emerald-500 mb-2" />
                                                 <span className="text-sm font-semibold dark:text-white">{file.name}</span>
                                             </div>
                                         ) : (
                                             <div className="flex flex-col items-center relative z-10">
                                                 <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-brand-500" />
                                                 <span className="text-sm text-gray-500 dark:text-gray-400">Drag & drop or Click to Upload</span>
                                             </div>
                                         )}
                                    </div>
                                    
                                    {uploadStats && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                                             <div className="flex justify-between mb-1 text-gray-700 dark:text-gray-300">
                                                 <span>Success: <span className="text-emerald-600 font-bold">{uploadStats.success}</span></span>
                                                 <span>Failed: <span className="text-rose-600 font-bold">{uploadStats.failed}</span></span>
                                             </div>
                                             {uploadStats.errors?.length > 0 && (
                                                 <div className="mt-2 max-h-24 overflow-y-auto border-t border-gray-200 dark:border-gray-600 pt-2 text-rose-500">
                                                     {uploadStats.errors.map((err, i) => <div key={i} className="mb-1">• {err}</div>)}
                                                 </div>
                                             )}
                                        </div>
                                    )}

                                    <button
                                        onClick={processImport}
                                        disabled={!file || isUploading}
                                        className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-50 flex justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : "Import Roster"}
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
