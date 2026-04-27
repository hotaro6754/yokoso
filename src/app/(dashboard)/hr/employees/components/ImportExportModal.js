"use client";

import { useState, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Upload, FileDown, Loader2, X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "react-hot-toast";
import employeeService from "@/services/hr-services/employeeService";

export default function ImportExportModal({ isOpen, onClose, onImportSuccess }) {
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

    // Template Data Structure - Based on User and Employee tables
    const templateHeaders = [
        "firstName", "lastName", "email", "phone", "personalEmail",
        "dateOfBirth", "gender", "maritalStatus", "bloodGroup", "nationality",
        "birthPlace", "department", "designation", "joiningDate",
        "probationPeriod", "employmentType", "status", "workLocation", "workShift",
        "reportingManagerEmail", "annualCTC", "variablePay", "salaryTemplateName",
        "currentAddress", "permanentAddress", "city", "state", "pincode", "country",
        "emergencyContactName", "emergencyContactRelation", "emergencyContactPhone",
        "bankName", "accountNumber", "accountType", "ifscCode", "branchName",
        "panNumber", "aadhaarNumber", "pfNumber", "uanNumber", "passportNumber", "esiNumber",
        // One-time Bonuses
        "joiningBonusAmount", "joiningBonusDate", "referralBonusAmount", "referralBonusDate", "performanceBonusAmount", "performanceBonusDate",
        // Family Details
        "Spouse Name", "Spouse Gender", "Spouse DOB",
        "Kid 1 Name", "Kid 1 Gender", "Kid 1 DOB",
        "Kid 2 Name", "Kid 2 Gender", "Kid 2 DOB",
        "Mother Name", "Mother Gender", "Mother DOB", "Mother Age",
        "Father Name", "Father Gender", "Father DOB", "Father Age",
        // Education Details
        "10th Institute", "10th Year", "10th %/CGPA",
        "12th Institute", "12th Year", "12th %/CGPA",
        "Graduation Institute", "Graduation Year", "Graduation %/CGPA",
        "PG Institute", "PG Year", "PG %/CGPA",
        // Previous Employment
        "Prev Company 1", "Prev Designation 1", "Prev From Date 1", "Prev To Date 1"
    ];

    const sampleData = [
        {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@zodeck.com",
            phone: "9876543210",
            personalEmail: "john.personal@gmail.com",
            dateOfBirth: "1990-01-15",
            gender: "MALE",
            maritalStatus: "SINGLE",
            bloodGroup: "O_POSITIVE",
            nationality: "Indian",
            birthPlace: "Mumbai",
            department: "Engineering",
            designation: "Software Engineer",
            joiningDate: "2023-05-01",
            probationPeriod: 6,
            employmentType: "FULL_TIME",
            status: "ACTIVE",
            workLocation: "Main Office",
            workShift: "General",
            reportingManagerEmail: "manager@zodeck.com",
            annualCTC: 900000,
            variablePay: 100000,
            salaryTemplateName: "Standard Template",
            currentAddress: "123, Maple Street",
            permanentAddress: "456, Oak Road",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            country: "India",
            emergencyContactName: "Jane Doe",
            emergencyContactRelation: "Sister",
            emergencyContactPhone: "9123456780",
            bankName: "HDFC Bank",
            accountNumber: "50100012345678",
            accountType: "SAVINGS",
            ifscCode: "HDFC0001234",
            branchName: "Andheri West",
            panNumber: "ABCDE1234F",
            aadhaarNumber: "123456789012",
            pfNumber: "MH/123/456",
            uanNumber: "100123456789",
            passportNumber: "ZODEK1234567",
            esiNumber: "31-00-123456-001-001",
            joiningBonusAmount: 5000,
            joiningBonusDate: "2023-06-01",
            referralBonusAmount: 2000,
            referralBonusDate: "2023-07-01",
            performanceBonusAmount: 10000,
            performanceBonusDate: "2023-12-31",
            // Family
            "Spouse Name": "Jane Doe", "Spouse Gender": "FEMALE", "Spouse DOB": "1992-05-20",
            "Kid 1 Name": "Jimmy Doe", "Kid 1 Gender": "MALE", "Kid 1 DOB": "2015-08-15",
            "Mother Name": "Mary Doe", "Mother Gender": "FEMALE", "Mother DOB": "1965-10-10", "Mother Age": "60",
            "Father Name": "Richard Doe", "Father Gender": "MALE", "Father DOB": "1960-12-12", "Father Age": "65",
            // Education
            "10th Institute": "City High School", "10th Year": "2006", "10th %/CGPA": "90%",
            "12th Institute": "Junior College", "12th Year": "2008", "12th %/CGPA": "85%",
            "Graduation Institute": "Tech University", "Graduation Year": "2012", "Graduation %/CGPA": "8.5 CGPA",
            // Employment
            "Prev Company 1": "Previous Tech Corp", "Prev Designation 1": "Junior Developer", "Prev From Date 1": "2012-07-01", "Prev To Date 1": "2015-05-30"
        }
    ];

    const exportTemplate = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(sampleData, { header: templateHeaders });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Employees");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "employee_import_template_v2.xlsx");
            toast.success("Template downloaded successfully");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to download template");
        }
    };

    const handleExportAll = async () => {
        try {
            setIsUploading(true);
            // Fetch all employees with a large limit
            const response = await employeeService.getAllEmployees({ limit: 10000 });
            const employees = response.success ? (response.data || []) : (response.data?.users || response.data || []);

            if (!employees || employees.length === 0) {
                toast.error("No employees found to export");
                return;
            }

            // Flatten and format data for export
            const exportData = employees.map(emp => {
                const profile = emp.employee || emp.profile || {};

                // Helper to get nested value or string
                const getValue = (val) => (typeof val === 'object' && val !== null ? val.name : val) || '';
                const familyDetails = profile.familyDetails || [];
                const findFamilyMember = (relation) => familyDetails.find((member) => {
                    const memberRelation = String(member.relation || '').toLowerCase();
                    return memberRelation === relation.toLowerCase() || memberRelation === relation.toUpperCase().toLowerCase();
                }) || {};
                const getFamilyDob = (member) => member.dateOfBirth || member.dob || '';
                const mother = findFamilyMember('Mother');
                const father = findFamilyMember('Father');
                const spouse = findFamilyMember('Spouse');

                return {
                    "Employee ID": emp.id || profile.employeeId || emp.employeeCode || '',
                    "First Name": emp.firstName || profile.firstName || '',
                    "Last Name": emp.lastName || profile.lastName || '',
                    "Email": emp.email || '',
                    "Phone": emp.phone || profile.phone || '',
                    "Personal Email": profile.personalEmail || '',
                    "Department": getValue(emp.department) || getValue(profile.department),
                    "Designation": getValue(emp.designation) || getValue(profile.designation),
                    "Reporting Manager": emp.reportingManager ? `${emp.reportingManager.firstName || ''} ${emp.reportingManager.lastName || ''}`.trim() : '',
                    "Joining Date": profile.joiningDate || emp.joiningDate || '',
                    "Status": emp.status || (emp.isActive ? 'ACTIVE' : 'INACTIVE'),
                    "Work Location": profile.workLocation || '',
                    "Employment Type": profile.employmentType || emp.employmentType || '',
                    "Date of Birth": profile.dateOfBirth || '',
                    "Gender": profile.gender || '',
                    "Nationality": profile.nationality || '',
                    "Marital Status": profile.maritalStatus || '',
                    "Blood Group": profile.bloodGroup || '',
                    "System Role": emp.systemRole || '',
                    "PAN Number": emp.panNumber || '',
                    "Aadhaar Number": emp.aadhaarNumber || '',
                    "UAN Number": emp.uanNumber || '',
                    "Passport Number": emp.passportNumber || '',
                    // Family Details
                    "Spouse Name": spouse.name || '',
                    "Spouse Gender": spouse.gender || '',
                    "Spouse DOB": getFamilyDob(spouse),
                    "Mother Name": mother.name || '',
                    "Mother Gender": mother.gender || '',
                    "Mother DOB": getFamilyDob(mother),
                    "Mother Age": mother.age || '',
                    "Father Name": father.name || '',
                    "Father Gender": father.gender || '',
                    "Father DOB": getFamilyDob(father),
                    "Father Age": father.age || '',
                    // Education Details
                    "10th Institute": (profile.educationDetails || []).find(e => e.degree === '10th')?.institute || '',
                    "10th Year": (profile.educationDetails || []).find(e => e.degree === '10th')?.year || '',
                    "10th %/CGPA": (profile.educationDetails || []).find(e => e.degree === '10th')?.percentage || '',
                    "12th Institute": (profile.educationDetails || []).find(e => e.degree === '12th')?.institute || '',
                    "12th Year": (profile.educationDetails || []).find(e => e.degree === '12th')?.year || '',
                    "12th %/CGPA": (profile.educationDetails || []).find(e => e.degree === '12th')?.percentage || '',
                    "Graduation Institute": (profile.educationDetails || []).find(e => e.degree === 'Graduation')?.institute || '',
                    "Graduation Year": (profile.educationDetails || []).find(e => e.degree === 'Graduation')?.year || '',
                    "Graduation %/CGPA": (profile.educationDetails || []).find(e => e.degree === 'Graduation')?.percentage || '',
                    // Previous Employment
                    "Prev Company 1": (profile.employmentDetails || []).length > 0 ? profile.employmentDetails[0].company : '',
                    "Prev Designation 1": (profile.employmentDetails || []).length > 0 ? profile.employmentDetails[0].designation : '',
                    "Prev From Date 1": (profile.employmentDetails || []).length > 0 ? profile.employmentDetails[0].from : ''
                };
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "All Employees");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });

            const timestamp = new Date().toISOString().split('T')[0];
            saveAs(data, `all_employees_export_${timestamp}.xlsx`);
            toast.success(`Successfully exported ${employees.length} employees`);

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

    const processImport = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setIsUploading(true);
        setUploadStats(null);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: true, dateNF: 'yyyy-mm-dd' });

                if (jsonData.length === 0) {
                    toast.error("The uploaded file is empty");
                    setIsUploading(false);
                    return;
                }

                // Validate structure
                const fileKeys = Object.keys(jsonData[0]);
                const requiredKeys = ["firstName", "lastName", "email"];
                const missingKeys = requiredKeys.filter(key => !fileKeys.includes(key));

                if (missingKeys.length > 0) {
                    toast.error(`Invalid file format. Missing columns: ${missingKeys.join(", ")}`);
                    setIsUploading(false);
                    return;
                }

                // Map and prepare payloads
                const employeesToImport = jsonData.map(row => {
                    // Helper to format date safely
                    const formatDate = (val) => {
                        if (!val) return undefined;
                        const d = val instanceof Date ? val : new Date(val);
                        return isNaN(d.getTime()) ? undefined : d.toISOString();
                    };

                    const calculateAge = (dateValue) => {
                        if (!dateValue) return '';
                        const birthDate = new Date(dateValue);
                        if (Number.isNaN(birthDate.getTime())) return '';

                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();

                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            age -= 1;
                        }

                        return age >= 0 ? String(age) : '';
                    };

                    const normalizeAge = (value) => value ? String(value).replace(/\D/g, '').slice(0, 3) : '';
                    const buildFamilyMember = (nameKey, relation, genderKey, dobKey, ageKey) => {
                        if (!row[nameKey]) return null;
                        const dob = formatDate(row[dobKey]);

                        return {
                            name: row[nameKey],
                            relation,
                            gender: row[genderKey],
                            dob,
                            dateOfBirth: dob,
                            age: normalizeAge(row[ageKey]) || calculateAge(dob)
                        };
                    };

                    // Helper to format blood group if user typed O+, etc.
                    let bg = row.bloodGroup ? String(row.bloodGroup).toUpperCase().trim() : undefined;
                    if (bg) {
                        bg = bg.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
                        if (!bg.includes('_POSITIVE') && !bg.includes('_NEGATIVE')) {
                            // handle case where they typed POSITIVE instead of _POSITIVE
                            bg = bg.replace('POSITIVE', '_POSITIVE').replace('NEGATIVE', '_NEGATIVE');
                        }
                    }

                    return {
                        // basic
                        employeeId: row.employeeId,
                        firstName: row.firstName || "",
                        lastName: row.lastName || "",
                        email: row.email,
                        phone: row.phone ? String(row.phone) : undefined,
                        personalEmail: row.personalEmail,
                        dateOfBirth: formatDate(row.dateOfBirth),
                        gender: row.gender ? String(row.gender).toUpperCase().trim() : undefined,
                        maritalStatus: row.maritalStatus ? String(row.maritalStatus).toUpperCase().trim() : undefined,
                        bloodGroup: bg,
                        nationality: row.nationality,
                        birthPlace: row.birthPlace,

                        // work
                        department: row.department,
                        designation: row.designation,
                        joiningDate: formatDate(row.joiningDate),
                        probationPeriod: row.probationPeriod,
                        employmentType: row.employmentType ? String(row.employmentType).toUpperCase().replace(' ', '_').trim() : undefined,
                        status: row.status ? String(row.status).toUpperCase().replace(' ', '_').trim() : 'ACTIVE',
                        workLocation: row.workLocation,
                        workShift: row.workShift,
                        reportingManagerEmail: row.reportingManagerEmail,
                        annualCTC: row.annualCTC,
                        variablePay: row.variablePay,
                        salaryTemplate: row.salaryTemplateName,

                        // address
                        currentAddress: row.currentAddress,
                        permanentAddress: row.permanentAddress,
                        city: row.city,
                        state: row.state,
                        pincode: row.pincode ? String(row.pincode) : undefined,
                        country: row.country,

                        // emergency
                        emergencyContactName: row.emergencyContactName,
                        emergencyContactRelation: row.emergencyContactRelation,
                        emergencyContactPhone: row.emergencyContactPhone ? String(row.emergencyContactPhone) : undefined,

                        // banking & ID
                        bankName: row.bankName,
                        accountNumber: row.accountNumber ? String(row.accountNumber) : undefined,
                        accountType: row.accountType ? String(row.accountType).toUpperCase().trim() : 'SAVINGS',
                        ifscCode: row.ifscCode,
                        branchName: row.branchName,
                        panNumber: row.panNumber,
                        aadhaarNumber: row.aadhaarNumber ? String(row.aadhaarNumber) : undefined,
                        pfNumber: row.pfNumber,
                        uanNumber: row.uanNumber ? String(row.uanNumber) : undefined,
                        passportNumber: row.passportNumber ? String(row.passportNumber) : undefined,
                        esiNumber: row.esiNumber,

                        // One-time Bonuses
                        joiningBonusAmount: row.joiningBonusAmount,
                        joiningBonusDate: formatDate(row.joiningBonusDate),
                        referralBonusAmount: row.referralBonusAmount,
                        referralBonusDate: formatDate(row.referralBonusDate),
                        performanceBonusAmount: row.performanceBonusAmount,
                        performanceBonusDate: formatDate(row.performanceBonusDate),

                        // Family Details
                        familyDetails: [
                            buildFamilyMember("Spouse Name", "Spouse", "Spouse Gender", "Spouse DOB", "Spouse Age"),
                            buildFamilyMember("Kid 1 Name", "Kid 1", "Kid 1 Gender", "Kid 1 DOB", "Kid 1 Age"),
                            buildFamilyMember("Kid 2 Name", "Kid 2", "Kid 2 Gender", "Kid 2 DOB", "Kid 2 Age"),
                            buildFamilyMember("Mother Name", "Mother", "Mother Gender", "Mother DOB", "Mother Age"),
                            buildFamilyMember("Father Name", "Father", "Father Gender", "Father DOB", "Father Age"),
                        ].filter(Boolean),

                        // Education Details
                        educationDetails: [
                            row["10th Institute"] ? { degree: '10th', institute: row["10th Institute"], year: row["10th Year"], percentage: row["10th %/CGPA"] } : null,
                            row["12th Institute"] ? { degree: '12th', institute: row["12th Institute"], year: row["12th Year"], percentage: row["12th %/CGPA"] } : null,
                            row["Graduation Institute"] ? { degree: 'Graduation', institute: row["Graduation Institute"], year: row["Graduation Year"], percentage: row["Graduation %/CGPA"] } : null,
                            row["PG Institute"] ? { degree: 'PG', institute: row["PG Institute"], year: row["PG Year"], percentage: row["PG %/CGPA"] } : null,
                        ].filter(Boolean),

                        // Employment Details
                        employmentDetails: [
                            row["Prev Company 1"] ? { company: row["Prev Company 1"], designation: row["Prev Designation 1"], from: formatDate(row["Prev From Date 1"]), to: formatDate(row["Prev To Date 1"]) } : null,
                        ].filter(Boolean)
                    };
                });

                const BATCH_SIZE = 10;
                let totalImported = 0;
                let totalFailed = 0;
                let allErrors = [];

                for (let i = 0; i < employeesToImport.length; i += BATCH_SIZE) {
                    const batch = employeesToImport.slice(i, i + BATCH_SIZE);
                    const progress = Math.round((i / employeesToImport.length) * 100);
                    setUploadProgress(progress);

                    try {
                        const response = await employeeService.importEmployees(batch);
                        if (response.success) {
                            totalImported += response.data.imported || 0;
                            totalFailed += response.data.failed || 0;
                            if (response.data.errors) {
                                allErrors = [...allErrors, ...response.data.errors];
                            }
                        }
                    } catch (err) {
                        console.error(`Batch ${i / BATCH_SIZE} error:`, err);
                        totalFailed += batch.length;
                        allErrors.push(`Batch starting at row ${i + 1} failed: ${err.message}`);
                    }
                }

                setUploadProgress(100);
                setUploadStats({
                    total: employeesToImport.length,
                    success: totalImported,
                    failed: totalFailed,
                    errors: allErrors
                });

                if (totalImported > 0) {
                    toast.success(`Successfully imported ${totalImported} employees`);
                }

                if (totalFailed > 0) {
                    toast.error(`Some records failed to import`);
                }

                if (onImportSuccess && totalImported > 0) {
                    setTimeout(() => {
                        onImportSuccess();
                    }, 1500);
                }
            } catch (error) {
                console.error("Import error details:", error);
                const errorMessage = error.message || "Failed to process file";
                toast.error(errorMessage);
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
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
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Importing Data</h4>
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
                                        Import / Export Employees
                                    </Dialog.Title>
                                    <button
                                        onClick={handleClose}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-brand-50/50 dark:bg-brand-500/5 p-4 rounded-xl border border-brand-100 dark:border-brand-500/10 mb-6">
                                        <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-300 mb-1 flex items-center gap-2">
                                            <FileDown className="w-4 h-4" />
                                            Export
                                        </h4>
                                        <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mb-4">
                                            Download templates or export your entire employee database.
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
                                                id="import-file-input"
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
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                        onClick={handleClose}
                                        disabled={isUploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-[2] py-3 px-4 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                                        onClick={processImport}
                                        disabled={!file || isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Importing...
                                            </>
                                        ) : (
                                            'Start Data Import'
                                        )}
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
