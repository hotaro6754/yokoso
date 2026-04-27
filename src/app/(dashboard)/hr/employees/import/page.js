"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  FileDown, 
  Loader2, 
  ArrowLeft, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Eye,
  XCircle,
  X,
  Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "sonner";
import employeeService from "@/services/hr-services/employeeService";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function EmployeeImportPage() {
    const router = useRouter();
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const basePath = pathname.startsWith("/it-admin") ? "/it-admin" : "/hr";
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStats, setUploadStats] = useState(null);
    const [view, setView] = useState("selection"); // selection, uploading, results
    const [previewRows, setPreviewRows] = useState([]);
    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [uploadType, setUploadType] = useState("new"); // new | update
    const fileInputRef = useRef(null);

    const clearSelectedFile = () => {
        setFile(null);
        setUploadStats(null);
        setUploadProgress(0);
        setPreviewRows([]);
        setPreviewHeaders([]);
        setIsPreviewOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const uploadTemplates = {
        new: {
            label: "New Employee Upload",
            description: "Full employee master data (personal, professional, banking, and compliance).",
            headers: [
                "employeeId", "firstName", "lastName", "email", "phone", "personalEmail",
                "dateOfBirth", "gender", "maritalStatus", "bloodGroup", "nationality",
                "birthPlace", "department", "designation", "joiningDate",
                "probationPeriod", "confirmationDate", "employmentType", "status", "workLocation", "workShift",
                "reportingManagerEmail", "reportingManagerId",
                "currentAddress", "permanentAddress", "city", "state", "pincode", "country",
                "emergencyContactName", "emergencyContactRelation", "emergencyContactPhone",
                "bankName", "accountNumber", "accountType", "ifscCode", "accountHolderName",
                "panNumber", "aadhaarNumber", "uanNumber", "passportNumber",
                "annualCTC", "salaryTemplate",
                "Spouse Name", "Spouse Gender", "Spouse DOB",
                "Kid 1 Name", "Kid 1 Gender", "Kid 1 DOB",
                "Kid 2 Name", "Kid 2 Gender", "Kid 2 DOB",
                "Mother Name", "Mother Gender", "Mother DOB", "Mother Age",
                "Father Name", "Father Gender", "Father DOB", "Father Age",
                "10th Degree/Course", "10th Institute", "10th Year of passing", "10th % CGPA",
                "12th Degree/Course", "12th Institute", "12th Year of passing", "12th % CGPA",
                "Graduation Degree/Course", "Graduation Institute", "Graduation Year of passing", "Graduation % CGPA",
                "PG Degree/Course", "PG Institute", "PG Year of passing", "PG % CGPA",
                "Company 1", "Designation 1", "From Date 1", "To Date 1"
            ],
            sampleData: [
                {
                    employeeId: "EMP001",
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
                    confirmationDate: "2023-11-01",
                    employmentType: "FULL_TIME",
                    status: "ACTIVE",
                    workLocation: "Main Office",
                    workShift: "General",
                    reportingManagerEmail: "manager@zodeck.com",
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
                    accountHolderName: "John Doe",
                    panNumber: "ABCDE1234F",
                    annualCTC: "600000",
                    salaryTemplate: "Standard Software Engineer",
                    aadhaarNumber: "123456789012",
                    uanNumber: "100123456789",
                    passportNumber: "ZODEK1234567",
                    "Spouse Name": "Jane Doe", "Spouse Gender": "FEMALE", "Spouse DOB": "1992-05-20",
                    "Kid 1 Name": "Jimmy Doe", "Kid 1 Gender": "MALE", "Kid 1 DOB": "2015-08-15",
                    "Kid 2 Name": "Jenny Doe", "Kid 2 Gender": "FEMALE", "Kid 2 DOB": "2018-03-12",
                    "Mother Name": "Mary Doe", "Mother Gender": "FEMALE", "Mother DOB": "1965-10-10", "Mother Age": "60",
                    "Father Name": "Richard Doe", "Father Gender": "MALE", "Father DOB": "1960-12-12", "Father Age": "65",
                    "10th Degree/Course": "10th", "10th Institute": "City High School", "10th Year of passing": "2006", "10th % CGPA": "90%",
                    "12th Degree/Course": "12th", "12th Institute": "Junior College", "12th Year of passing": "2008", "12th % CGPA": "85%",
                    "Graduation Degree/Course": "B.Tech", "Graduation Institute": "Tech University", "Graduation Year of passing": "2012", "Graduation % CGPA": "8.5 CGPA",
                    "PG Degree/Course": "M.Tech", "PG Institute": "Tech University", "PG Year of passing": "2014", "PG % CGPA": "8.8 CGPA",
                    "Company 1": "Previous Tech Corp", "Designation 1": "Junior Developer", "From Date 1": "2012-07-01", "To Date 1": "2015-05-30"
                }
            ]
        },
        update: {
            label: "Update Existing Employees",
            description: "Update select fields like department, designation, manager, or salary for existing employees.",
            headers: [
                "employeeId", "email",
                "department", "designation", "reportingManagerEmail", "reportingManagerId",
                "joiningDate", "probationPeriod", "noticePeriod", "confirmationDate",
                "employmentType", "status", "workLocation", "workShift",
                "baseSalary", "phone", "personalEmail"
            ],
            sampleData: [
                {
                    employeeId: "EMP001",
                    email: "john.doe@zodeck.com",
                    department: "Engineering",
                    designation: "Senior Software Engineer",
                    reportingManagerEmail: "manager@zodeck.com",
                    employmentType: "FULL_TIME",
                    status: "ACTIVE",
                    workLocation: "Main Office",
                    workShift: "General",
                    baseSalary: 1200000
                }
            ]
        }
    };

    const guidelinesByType = {
        new: [
            { title: "Mandatory Fields", text: "Employee ID, Name, Email, Gender, Marital Status, DOB, Aadhaar, PAN, Bank Details, Joining Date, and Probation." },
            { title: "Banking", text: "Bank Name, Account Number, IFSC (e.g., HDFC0001234), and Account Holder Name are required." },
            { title: "Formats", text: "Dates: YYYY-MM-DD. Aadhaar: 12 digits. PAN: ABCDE1234F." },
            { title: "Confirmation Date", text: "You can provide a custom confirmation date in the template." },
            { title: "Update Mode", text: "If you provide employeeId or an existing email, you can upload only fields you want to update." }
        ],
        update: [
            { title: "Identifier Required", text: "Provide Employee ID or Email to update an existing employee." },
            { title: "At Least One Field", text: "Include at least one field to update (e.g., Department, Designation, Manager)." },
            { title: "Optional Fields", text: "You can update status, work location, shift, probation, or salary." },
            { title: "Formats", text: "Dates: YYYY-MM-DD. Salary can be numeric." }
        ]
    };

    const activeTemplate = uploadTemplates[uploadType];
    const templateHeaders = activeTemplate.headers;
    const sampleData = activeTemplate.sampleData;

    const handleUploadTypeChange = (nextType) => {
        if (nextType === uploadType) return;
        setUploadType(nextType);
        setFile(null);
        setUploadStats(null);
        setPreviewRows([]);
        setPreviewHeaders([]);
        setIsPreviewOpen(false);
    };

    const downloadTemplate = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(sampleData, { header: templateHeaders });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Employees");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            const fileSuffix = uploadType === "update" ? "update" : "new";
            saveAs(data, `zodeck_employee_import_${fileSuffix}_template.xlsx`);
            toast.success("Template downloaded successfully");
        } catch (error) {
            console.error("Template download failed:", error);
            toast.error("Failed to download template");
        }
    };

    const downloadFailedReport = () => {
        try {
            if (!uploadStats?.failedRows || uploadStats.failedRows.length === 0) {
                toast.info("No failed rows to download");
                return;
            }

            const errorHeader = "Error";
            const rowsWithError = uploadStats.failedRows.map((item) => ({
                ...item.data,
                [errorHeader]: item.error
            }));

            const headers = [...templateHeaders, errorHeader];
            const ws = XLSX.utils.json_to_sheet(rowsWithError, { header: headers });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Failed Rows");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            const fileSuffix = uploadType === "update" ? "update" : "new";
            saveAs(data, `zodeck_employee_import_${fileSuffix}_failed_rows.xlsx`);
            toast.success("Failed report downloaded");
        } catch (error) {
            console.error("Failed report download error:", error);
            toast.error("Unable to download failed report");
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
                toast.error("Please upload a valid Excel file (.xlsx or .xls)");
                e.target.value = "";
                return;
            }
            setFile(selectedFile);
            setUploadStats(null);
            setPreviewRows([]);
            setPreviewHeaders([]);
            setIsPreviewOpen(false);

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(sheet, { raw: true, dateNF: 'yyyy-mm-dd' });
                    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
                    setPreviewHeaders(headers);
                    setPreviewRows(rows.slice(0, 5));
                } catch (err) {
                    console.error("Preview parse error:", err);
                    toast.error("Unable to preview this file. Please check the template format.");
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const processImport = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setIsUploading(true);
        setView("uploading");
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
                    setView("selection");
                    return;
                }

                const validateRow = (row, index) => {
                    const errors = [];
                    const hasEmployeeId = row.employeeId !== undefined && row.employeeId !== null && String(row.employeeId).trim() !== '';

                    const updateFields = [
                        'department', 'designation', 'reportingManagerEmail', 'reportingManagerId',
                        'joiningDate', 'probationPeriod', 'noticePeriod', 'confirmationDate',
                        'employmentType', 'status', 'workLocation', 'workShift', 'baseSalary',
                        'phone', 'personalEmail'
                    ];
                    const hasUpdateFields = updateFields.some((key) => {
                        const val = row[key];
                        return val !== undefined && val !== null && String(val).trim() !== '';
                    });

                    const isUpdateTemplate = uploadType === "update";
                    if (isUpdateTemplate) {
                        const hasEmail = row.email && String(row.email).trim() !== '';
                        if (!hasEmployeeId && !hasEmail) {
                            errors.push('Employee ID or Email is required for updates');
                        }
                        if (!hasUpdateFields) {
                            errors.push('Provide at least one field to update');
                        }
                        return errors;
                    }

                    if (hasEmployeeId) {
                        // Update mode: only Employee ID is required
                        if (!String(row.employeeId).trim()) {
                            errors.push('Employee ID is required for updates');
                        }
                        return errors;
                    }

                    // Update by email mode: allow partial rows when email is present
                    if (row.email && String(row.email).trim() !== '' && hasUpdateFields) {
                        return errors;
                    }

                    const mandatory = {
                        employeeId: "Employee ID",
                        firstName: "First Name",
                        lastName: "Last Name",
                        email: "Email",
                        dateOfBirth: "Date of Birth",
                        gender: "Gender",
                        maritalStatus: "Marital Status",
                        aadhaarNumber: "Aadhaar Number",
                        panNumber: "PAN Number",
                        bankName: "Bank Name",
                        accountNumber: "Account Number",
                        ifscCode: "IFSC Code",
                        accountHolderName: "Account Holder Name",
                        accountType: "Account Type",
                        joiningDate: "Joining Date",
                        probationPeriod: "Probation Period"
                    };

                    Object.entries(mandatory).forEach(([key, label]) => {
                        if (row[key] === undefined || row[key] === null || String(row[key]).trim() === "") {
                            errors.push(`${label} is required`);
                        }
                    });

                    // Format Validations
                    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                        errors.push("Invalid Email format");
                    }
                    if (row.aadhaarNumber && !/^\d{11,12}$/.test(String(row.aadhaarNumber))) {
                        errors.push("Aadhaar must be 11 or 12 digits");
                    }
                    if (row.panNumber && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(String(row.panNumber).toUpperCase())) {
                        errors.push("Invalid PAN format (e.g. ABCDE1234F)");
                    }
                    if (row.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(row.ifscCode).toUpperCase())) {
                        errors.push("Invalid IFSC format (e.g. HDFC0001234)");
                    }

                    // Salary Structure Validation
                    if (row.annualCTC && (!row.salaryTemplate || String(row.salaryTemplate).trim() === "")) {
                        errors.push("Salary Template is required when Annual CTC is provided");
                    }

                    return errors;
                };

                // Prepare payloads & Pre-validation
                const employeesToImport = jsonData.map((row, index) => {
                    const formatDate = (val) => {
                        if (!val) return undefined;
                        const d = val instanceof Date ? val : new Date(val);
                        return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
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

                    const validationErrors = validateRow(row, index);

                    let bg = row.bloodGroup ? String(row.bloodGroup).toUpperCase().trim() : undefined;
                    if (bg) {
                        bg = bg.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
                        if (!bg.includes('_POSITIVE') && !bg.includes('_NEGATIVE')) {
                            bg = bg.replace('POSITIVE', '_POSITIVE').replace('NEGATIVE', '_NEGATIVE');
                        }
                    }

                    return {
                        employeeId: row.employeeId || "",
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
                        department: row.department,
                        designation: row.designation,
                        joiningDate: formatDate(row.joiningDate),
                        probationPeriod: row.probationPeriod,
                        confirmationDate: formatDate(row.confirmationDate),
                        employmentType: row.employmentType ? String(row.employmentType).toUpperCase().replace(/[\s-]/g, '_').trim() : "FULL_TIME",
                        status: row.status ? String(row.status).toUpperCase().replace(' ', '_').trim() : 'ACTIVE',
                        workLocation: row.workLocation,
                        workShift: row.workShift,
                        reportingManagerEmail: row.reportingManagerEmail,
                        reportingManagerId: row.reportingManagerId,
                        currentAddress: row.currentAddress,
                        permanentAddress: row.permanentAddress,
                        city: row.city,
                        state: row.state,
                        pincode: row.pincode ? String(row.pincode) : undefined,
                        country: row.country,
                        emergencyContactName: row.emergencyContactName,
                        emergencyContactRelation: row.emergencyContactRelation,
                        emergencyContactPhone: row.emergencyContactPhone ? String(row.emergencyContactPhone) : undefined,
                        bankName: row.bankName,
                        accountNumber: row.accountNumber ? String(row.accountNumber) : undefined,
                        accountType: row.accountType ? String(row.accountType).toUpperCase().trim() : 'SAVINGS',
                        ifscCode: row.ifscCode,
                        accountHolderName: row.accountHolderName,
                        panNumber: row.panNumber,
                        aadhaarNumber: row.aadhaarNumber ? String(row.aadhaarNumber) : undefined,
                        uanNumber: row.uanNumber ? String(row.uanNumber) : undefined,
                        passportNumber: row.passportNumber ? String(row.passportNumber) : undefined,
                        annualCTC: row.annualCTC ? parseFloat(row.annualCTC) : undefined,
                        salaryTemplate: row.salaryTemplate,
                        
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
                            row["10th Institute"] || row["10th Degree/Course"] ? { degree: row["10th Degree/Course"] || '10th', institute: row["10th Institute"], year: row["10th Year of passing"], percentage: row["10th % CGPA"] } : null,
                            row["12th Institute"] || row["12th Degree/Course"] ? { degree: row["12th Degree/Course"] || '12th', institute: row["12th Institute"], year: row["12th Year of passing"], percentage: row["12th % CGPA"] } : null,
                            row["Graduation Institute"] || row["Graduation Degree/Course"] ? { degree: row["Graduation Degree/Course"] || 'Graduation', institute: row["Graduation Institute"], year: row["Graduation Year of passing"], percentage: row["Graduation % CGPA"] } : null,
                            row["PG Institute"] || row["PG Degree/Course"] ? { degree: row["PG Degree/Course"] || 'PG', institute: row["PG Institute"], year: row["PG Year of passing"], percentage: row["PG % CGPA"] } : null,
                        ].filter(Boolean),

                        // Employment Details
                        employmentDetails: [
                            row["Company 1"] ? { company: row["Company 1"], designation: row["Designation 1"], from: formatDate(row["From Date 1"]), to: formatDate(row["To Date 1"]) } : null,
                        ].filter(Boolean),

                        validationErrors // Attach errors for later
                    };
                });

                const BATCH_SIZE = 5;
                let totalImported = 0;
                let totalFailed = 0;
                let detailedErrors = [];
                let successRecords = [];
                let failedRows = [];

                // Filter out locally invalid records first
                const validEmployees = [];
                employeesToImport.forEach((emp, index) => {
                    if (emp.validationErrors && emp.validationErrors.length > 0) {
                        totalFailed++;
                        detailedErrors.push({
                            row: index + 1,
                            email: emp.email || 'N/A',
                            message: `Validation Failed: ${emp.validationErrors.join(", ")}`
                        });
                        failedRows.push({
                            row: index + 1,
                            error: `Validation Failed: ${emp.validationErrors.join(", ")}`,
                            data: jsonData[index] || {}
                        });
                    } else {
                        validEmployees.push(emp);
                    }
                });

                for (let i = 0; i < validEmployees.length; i += BATCH_SIZE) {
                    const batch = validEmployees.slice(i, i + BATCH_SIZE);
                    const progress = Math.round(((i + (employeesToImport.length - validEmployees.length)) / employeesToImport.length) * 100);
                    setUploadProgress(progress);

                    try {
                        const response = await employeeService.importEmployees(batch, uploadType);
                        if (response.success) {
                            const batchErrors = response.data.errors || [];
                            const errorIndices = new Set(batchErrors.map(e => e.index));
                            
                            totalImported += response.data.imported || 0;
                            totalFailed += response.data.failed || 0;

                            batch.forEach((item, idx) => {
                                if (errorIndices.has(idx)) {
                                    const err = batchErrors.find(e => e.index === idx);
                                    detailedErrors.push({
                                        row: i + idx + 1,
                                        email: item.email || 'N/A',
                                        message: err?.message || "Validation failed"
                                    });
                                    failedRows.push({
                                        row: i + idx + 1,
                                        error: err?.message || "Validation failed",
                                        data: jsonData[i + idx] || {}
                                    });
                                } else {
                                    successRecords.push({
                                        row: i + idx + 1,
                                        email: item.email || 'N/A',
                                        name: `${item.firstName} ${item.lastName}`.trim() || "N/A"
                                    });
                                }
                            });
                        }
                    } catch (err) {
                        console.error(`Batch error:`, err);
                        batch.forEach((item, idx) => {
                            totalFailed++;
                            detailedErrors.push({
                                row: item.row || "N/A", // Use the row number if available
                                email: item.email || 'N/A',
                                message: err.message || "Unknown error occurred"
                            });
                            failedRows.push({
                                row: i + idx + 1,
                                error: err.message || "Unknown error occurred",
                                data: jsonData[i + idx] || {}
                            });
                        });
                    }
                }

                setUploadProgress(100);
                setTimeout(() => {
                    setUploadStats({
                        total: employeesToImport.length,
                        success: totalImported,
                        failed: totalFailed,
                        errors: detailedErrors,
                        successRecords: successRecords,
                        failedRows: failedRows
                    });
                    setView("results");
                    setIsUploading(false);
                }, 500);

            } catch (error) {
                console.error("Processing error:", error);
                toast.error("Failed to process file. Please ensure it follows the template format.");
                setIsUploading(false);
                setView("selection");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="bg-gray-50 min-h-screen dark:bg-gray-900 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
                <Breadcrumb 
                    rightContent={
                        <button 
                            onClick={() => router.push(`${basePath}/employees`)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-500 dark:text-gray-400"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Employees
                        </button>
                    }
                />

                <div className="w-full mx-auto">
                    {view === "selection" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    Bulk Employee Import
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                                    Choose the right bulk upload format, then download and fill the matching template.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleUploadTypeChange("new")}
                                    className={`text-left rounded-2xl border p-5 transition-all shadow-sm ${uploadType === "new"
                                        ? "border-brand-300 bg-brand-50/70 dark:border-brand-500/40 dark:bg-brand-500/10"
                                        : "border-gray-200 bg-white hover:border-brand-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                        }`}
                                >
                                    <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">New Employees</p>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">Full Employee Upload</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Add new employees with personal, professional, and banking details.
                                    </p>
                                </button>

                                <button
                                    onClick={() => handleUploadTypeChange("update")}
                                    className={`text-left rounded-2xl border p-5 transition-all shadow-sm ${uploadType === "update"
                                        ? "border-brand-300 bg-brand-50/70 dark:border-brand-500/40 dark:bg-brand-500/10"
                                        : "border-gray-200 bg-white hover:border-brand-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                        }`}
                                >
                                    <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300">Existing Employees</p>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">Update Records</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Bulk update department, designation, manager, status, or salary fields.
                                    </p>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Step 1: Download Template */}
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col">
                                    <div className="h-12 w-12 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center mb-6">
                                        <FileDown className="w-6 h-6 text-brand-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Download Template</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 flex-1">
                                        Download the {activeTemplate.label} template with the required fields for this upload type.
                                    </p>
                                    <button 
                                        onClick={downloadTemplate}
                                        className="w-full py-3.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-5 h-5" />
                                        Download {uploadType === "update" ? "Update Template" : "New Employee Template"} (.xlsx)
                                    </button>
                                </div>

                                {/* Step 2: Upload Data */}
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col">
                                    <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                                        <Upload className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Upload File</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 flex-1">
                                        Upload the completed {activeTemplate.label} file. We will validate and process it in batches.
                                    </p>
                                    
                                    <div 
                                        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all group h-[58px] flex items-center justify-center
                                            ${file 
                                                ? 'border-emerald-400 bg-emerald-50/10' 
                                                : 'border-gray-200 dark:border-gray-700 hover:border-brand-500 hover:bg-brand-50/5'}`}
                                    >
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            accept=".xlsx, .xls"
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
                                                            if (!isUploading) clearSelectedFile();
                                                        }}
                                                        disabled={isUploading}
                                                        className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        title="Remove selected file"
                                                        aria-label="Remove selected file"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-500">
                                                    Select Excel file
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={processImport}
                                        disabled={!file}
                                        className="mt-4 w-full py-3.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Start Data Import
                                    </button>

                                    <button
                                        onClick={() => setIsPreviewOpen(true)}
                                        disabled={!file || previewHeaders.length === 0}
                                        className="mt-3 w-full py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-5 h-5" />
                                        Preview Data
                                    </button>
                                </div>
                            </div>

                            {/* Guidelines */}
                            <div className="bg-amber-50 dark:bg-amber-500/5 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                                <div className="flex gap-4">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center">
                                        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-900 dark:text-amber-300 font-bold mb-1">Important Guidelines:</h4>
                                        <ul className="text-amber-700 dark:text-amber-400/80 text-xs space-y-1.5 list-disc pl-4">
                                            {guidelinesByType[uploadType].map((item, idx) => (
                                                <li key={idx}>
                                                    <span className="font-bold">{item.title}:</span> {item.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
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
                                    style={{ animationDuration: '0.8s' }}
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

                    {view === "results" && uploadStats && (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative">
                                {/* Success/Fail Stats Header */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Import Summary</h2>
                                        <p className="text-gray-500 text-sm">Operation completed for {uploadStats.total} total records</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-center min-w-[120px]">
                                            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">SUCCESS</p>
                                            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{uploadStats.success}</p>
                                        </div>
                                        <div className="px-6 py-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-center min-w-[120px]">
                                            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">FAILED</p>
                                            <p className="text-3xl font-black text-rose-700 dark:text-rose-300">{uploadStats.failed}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Lists */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Success Log */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Successful Imports</h3>
                                        </div>
                                        {uploadStats.successRecords.length > 0 ? (
                                            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                        <tr>
                                                            <th className="px-3 py-2.5 font-bold text-gray-600">Row</th>
                                                            <th className="px-3 py-2.5 font-bold text-gray-600">Name</th>
                                                            <th className="px-3 py-2.5 font-bold text-gray-600">Email</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                        {uploadStats.successRecords.map((record, idx) => (
                                                            <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-colors">
                                                                <td className="px-3 py-3 font-mono text-gray-400">{record.row}</td>
                                                                <td className="px-3 py-3 font-bold text-gray-900 dark:text-white">{record.name}</td>
                                                                <td className="px-3 py-3 text-gray-500">{record.email}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                                                <p className="text-gray-400 text-sm italic">No records were imported successfully.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Detailed Error Log */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-rose-100 dark:bg-rose-500/20 rounded-lg">
                                                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Failure Logs</h3>
                                        </div>
                                        {uploadStats.errors.length > 0 ? (
                                            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                        <tr>
                                                            <th className="px-3 py-2.5 font-bold text-gray-600">Row</th>
                                                            <th className="px-3 py-2.5 font-bold text-gray-600">Email</th>
                                                            <th className="px-3 py-2.5 font-bold text-gray-600">Reason</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                        {uploadStats.errors.map((error, idx) => (
                                                            <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-500/5 transition-colors">
                                                                <td className="px-3 py-3 font-mono text-gray-400">{error.row}</td>
                                                                <td className="px-3 py-3 font-bold text-gray-900 dark:text-white">{error.email}</td>
                                                                <td className="px-3 py-3 text-rose-500 font-medium">{error.message}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-500/30">
                                                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    All records processed successfully!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 flex gap-4 flex-wrap">
                                    <button
                                        onClick={downloadFailedReport}
                                        disabled={!uploadStats.errors || uploadStats.errors.length === 0}
                                        className="flex-1 py-4 px-6 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileDown className="w-5 h-5" />
                                        Download Failed Report
                                    </button>
                                    <button 
                                        onClick={() => setView("selection")}
                                        className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Import Another File
                                    </button>
                                    <button 
                                        onClick={() => {
                                            toast.success("Navigating to directory...", { duration: 1500 });
                                            router.push(`${basePath}/employees`);
                                        }}
                                        className="flex-[2] py-4 px-6 rounded-2xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        View Employee List
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isPreviewOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Preview</h3>
                                        <p className="text-xs text-gray-500">Showing first 5 rows from the selected file.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <XCircle className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                <div className="max-h-[70vh] overflow-auto">
                                    {previewHeaders.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">No preview available.</div>
                                    ) : (
                                        <table className="min-w-full text-xs">
                                            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    {previewHeaders.map((h) => (
                                                        <th key={h} className="px-3 py-2 text-left font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {previewRows.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50">
                                                        {previewHeaders.map((h) => (
                                                            <td key={h} className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                                {row[h] !== undefined && row[h] !== null ? String(row[h]) : ""}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    <button
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
