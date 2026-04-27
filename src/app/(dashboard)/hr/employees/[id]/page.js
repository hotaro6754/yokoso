"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User, Mail, Phone, MapPin,
    Briefcase, ArrowLeft, Edit,
    FileText, CreditCard, CalendarDays, Clock, AlertTriangle,
    Eye, Download, GraduationCap, Users
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import employeeService from "@/services/hr-services/employeeService";
import { probationNoticeService } from "@/services/hr/probationNoticeService";
import { toast } from "sonner";
import { getFileUrl } from "@/utils/fileUrl";
import { differenceInDays, addDays } from "date-fns";

export default function EmployeeProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [activeNotice, setActiveNotice] = useState(null);
    const [activeProbation, setActiveProbation] = useState(null);
    const [loading, setLoading] = useState(true);

    const calculateFamilyAge = (dateValue) => {
        if (!dateValue) return "";
        const birthDate = new Date(dateValue);
        if (Number.isNaN(birthDate.getTime())) return "";

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age -= 1;
        }

        return age >= 0 ? String(age) : "";
    };

    const formatFamilyDate = (dateValue) => {
        if (!dateValue) return "-";
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return "-";

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isManagerView = pathname.startsWith('/manager');
    const basePath = pathname.startsWith('/it-admin')
        ? '/it-admin'
        : pathname.startsWith('/payroll')
            ? '/payroll'
            : pathname.startsWith('/finance-role')
                ? '/finance-role'
                : pathname.startsWith('/manager')
                    ? '/manager'
                    : pathname.startsWith('/dept-head')
                        ? '/dept-head'
                        : pathname.startsWith('/ld')
                            ? '/ld'
                            : pathname.startsWith('/company-admin')
                                ? '/company-admin'
                                : '/hr';
    const isCrudAllowed = pathname.startsWith('/hr') || pathname.startsWith('/company-admin') || pathname.startsWith('/it-admin');

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                // Fetch employee details
                const empResponse = await employeeService.getEmployeeById(id);
                if (empResponse.success) {
                    setEmployee({ ...empResponse.data, ...(empResponse.data.employee || {}) });
                }

                if (!isManagerView) {
                    // Fetch Active Notice Period Record
                    try {
                        const noticeResponse = await probationNoticeService.getNoticePeriods({ employeeId: id });
                        if (noticeResponse.success || Array.isArray(noticeResponse.data)) {
                            const notices = Array.isArray(noticeResponse.data) ? noticeResponse.data : [];
                            const active = notices.find(n => ['ACTIVE', 'EXTENDED', 'NOTICE_PERIOD'].includes(n.status));
                            if (active) setActiveNotice(active);
                        }
                    } catch (e) {
                        console.error("Error fetching notice periods", e);
                    }

                    // Fetch Active Probation Period Record
                    try {
                        const probResponse = await probationNoticeService.getProbationPeriods({ employeeId: id });
                        if (probResponse.success || Array.isArray(probResponse.data)) {
                            const probs = Array.isArray(probResponse.data) ? probResponse.data : [];
                            const active = probs.find(p => ['ACTIVE', 'EXTENDED', 'PROBATION'].includes(p.status));
                            if (active) setActiveProbation(active);
                        }
                    } catch (e) {
                        console.error("Error fetching probation periods", e);
                    }
                }

                // Fetch employee documents
                try {
                    const docsResponse = await employeeService.getEmployeeDocuments(id);
                    if (docsResponse.success) {
                        setDocuments(docsResponse.data || []);
                    }
                } catch (docError) {
                    console.error("Error fetching documents:", docError);
                    // Don't show error toast for documents, just log it
                }

                if (!isManagerView) {
                    // Fetch leave balances
                    try {
                        const leavesResponse = await employeeService.getLeaveBalances(id);
                        if (leavesResponse.success && Array.isArray(leavesResponse.data)) {
                            setLeaveBalances(leavesResponse.data);
                        } else {
                            setLeaveBalances([]);
                        }
                    } catch (leaveError) {
                        console.error("Error fetching leave balances:", leaveError);
                        setLeaveBalances([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching employee:", error);
                toast.error("Failed to load employee details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEmployeeData();
    }, [id]);

    const handleDownload = async (docId, fileName) => {
        try {
            const response = await employeeService.downloadDocument(id, docId);
            if (response.success && response.data?.url) {
                const link = document.createElement('a');
                link.href = response.data.url;
                link.setAttribute('download', response.data.fileName || fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                toast.error('Could not generate download link');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download document');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Employee Not Found</h2>
                <button
                    onClick={() => router.push(`${basePath}/employees`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                    <ArrowLeft size={18} /> Back to Directory
                </button>
            </div>
        );
    }

    const fullName = `${employee.firstName} ${employee.lastName}`;
    const joinDate = employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "-";
    const birthDate = employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "-";
    const statusValue = employee.status || "INACTIVE";
    // Probation and Notice Status Calculation
    const probationObj = {
        isActive: false,
        daysRemaining: 0,
        endDate: 'N/A',
        statusText: 'Active'
    };

    if (activeProbation) {
        // Use the explicit record if available
        const pEndDate = new Date(activeProbation.endDate || activeProbation.originalEndDate);
        probationObj.endDate = pEndDate.toLocaleDateString();
        probationObj.daysRemaining = differenceInDays(pEndDate, new Date());
        probationObj.statusText = activeProbation.status === 'PROBATION' ? 'In Progress' : activeProbation.status;
        probationObj.isActive = probationObj.daysRemaining > 0;
    } else {
        // Fallback to Employee object properties
        const probationDays = parseInt(employee.probationPeriod || 0);
        const hasProbation = probationDays > 0;

        let pEndDate = employee.confirmationDate ? new Date(employee.confirmationDate) : null;
        if (!pEndDate && hasProbation && employee.joiningDate) {
            pEndDate = addDays(new Date(employee.joiningDate), probationDays);
        }

        const daysRemainingProbation = pEndDate ? differenceInDays(pEndDate, new Date()) : 0;

        if (employee.status === 'PROBATION' || (employee.status === 'ACTIVE' && hasProbation && daysRemainingProbation >= -60)) {
            probationObj.isActive = daysRemainingProbation > 0;
            probationObj.daysRemaining = daysRemainingProbation;
            probationObj.endDate = pEndDate ? pEndDate.toLocaleDateString() : 'Pending Calculation';
            probationObj.statusText = employee.status === 'PROBATION' ? 'In Progress' : 'Active';
        }
    }

    const noticeObj = {
        isActive: false,
        daysRemaining: 0,
        lastWorkingDay: 'N/A',
        statusText: 'Serving Notice'
    };

    if (activeNotice) {
        // Use the explicit record if available
        let nEndDate;
        if (activeNotice.lastWorkingDay) {
            nEndDate = new Date(activeNotice.lastWorkingDay);
        } else if (activeNotice.resignationDate) {
            const days = parseInt(activeNotice.noticePeriod) || parseInt(employee.noticePeriod) || 0;
            nEndDate = addDays(new Date(activeNotice.resignationDate), days);
        } else {
            nEndDate = new Date();
        }

        noticeObj.lastWorkingDay = nEndDate.toLocaleDateString();
        noticeObj.daysRemaining = differenceInDays(nEndDate, new Date());
        noticeObj.statusText = activeNotice.status === 'NOTICE_PERIOD' ? 'Serving Notice' : activeNotice.status;
        noticeObj.isActive = noticeObj.daysRemaining > 0;
    } else {
        // Fallback to Employee object properties
        const resignationDateStr = employee.resignationDate;
        const hasResignationDate = resignationDateStr && !isNaN(new Date(resignationDateStr).getTime());

        if (employee.status === 'NOTICE_PERIOD' || (hasResignationDate && ['ACTIVE', 'RESIGNED', 'TERMINATED'].includes(employee.status || ''))) {
            const rDate = new Date(resignationDateStr || new Date());
            const noticeDays = parseInt(employee.noticePeriod || 0);
            const lDate = addDays(rDate, noticeDays);

            noticeObj.isActive = differenceInDays(lDate, new Date()) > 0;
            noticeObj.lastWorkingDay = lDate.toLocaleDateString();
            noticeObj.daysRemaining = differenceInDays(lDate, new Date());
        }
    }

    const derivedStatusValue =
        statusValue === 'PROBATION' && !probationObj.isActive && !noticeObj.isActive
            ? 'ACTIVE'
            : statusValue;

    const statusTone = derivedStatusValue === "ACTIVE"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
        : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";

    const personalItems = [
        { label: "Full Name", value: fullName },
        { label: "Gender", value: employee.gender || "-" },
        { label: "Date of Birth", value: birthDate },
        { label: "Marital Status", value: employee.maritalStatus || "-" },
        { label: "Blood Group", value: employee.bloodGroup || "-" },
        { label: "Nationality", value: employee.nationality || "-" },

        { label: "Birth Place", value: employee.birthPlace || "-" },
    ];

    const contactItems = [
        { label: "Official Email", value: employee.email || "-" },
        { label: "Personal Email", value: employee.personalEmail || "-" },
        { label: "Phone Number", value: employee.phone || "-" },
        { label: "Emergency Contact", value: employee.emergencyContact || "-" },
        { label: "Emergency Phone", value: employee.emergencyContactPhone || "-" },
        { label: "Current Address", value: employee.currentAddress || "-" },
    ];

    const professionalItems = [
        { label: "Employee ID", value: employee.employeeId || "-" },
        { label: "Designation", value: employee.designation?.name || "-" },
        { label: "Department", value: employee.department?.name || "-" },
        { label: "Joining Date", value: joinDate },
        { label: "Employment Type", value: employee.employmentType || "-" },
        { label: "Probation Policy", value: employee.probationPeriod ? `${employee.probationPeriod} Days` : "N/A" },
        { label: "Notice Policy", value: employee.noticePeriod ? `${employee.noticePeriod} Days` : "N/A" },
        { label: "Work Shift", value: employee.workShift || "-" },
        { label: "Work Location", value: employee.workLocation || "-" },
        { label: "Reporting To", value: employee.reportingTo ? `${employee.reportingTo.firstName} ${employee.reportingTo.lastName}` : "-" },
    ];

    const bankingItems = [
        { label: "Bank Name", value: employee.bankName || "-" },
        { label: "Account Number", value: employee.accountNumber || "-" },
        { label: "IFSC Code", value: employee.ifscCode || "-" },
        { label: "PAN Number", value: employee.panNumber || "-" },
        { label: "Aadhaar Number", value: employee.aadhaarNumber || "-" },
        { label: "Total CTC (Annual)", value: employee.ctc ? `₹${employee.ctc.toLocaleString()}` : "-" },
        { label: "Variable Pay (VP)", value: employee.variablePay ? `₹${employee.variablePay.toLocaleString()}` : "-" },
        { label: "Fixed CTC", value: employee.ctc ? `₹${(employee.ctc - (employee.variablePay || 0)).toLocaleString()}` : "-" },
        { label: "Tax Regime", value: employee.taxRegime || "NEW" },
        { 
            label: "Joining Bonus", 
            value: employee.joiningBonusAmount 
                ? `₹${employee.joiningBonusAmount.toLocaleString()}${employee.joiningBonusDate ? ` on ${new Date(employee.joiningBonusDate).toLocaleDateString()}` : ''}`
                : "-" 
        },
        { 
            label: "Referral Bonus", 
            value: employee.referralBonusAmount 
                ? `₹${employee.referralBonusAmount.toLocaleString()}${employee.referralBonusDate ? ` on ${new Date(employee.referralBonusDate).toLocaleDateString()}` : ''}`
                : "-" 
        },
        { 
            label: "Performance Bonus", 
            value: employee.performanceBonusAmount 
                ? `₹${employee.performanceBonusAmount.toLocaleString()}${employee.performanceBonusDate ? ` on ${new Date(employee.performanceBonusDate).toLocaleDateString()}` : ''}`
                : "-" 
        },
    ];


    const profileImageUrl = getFileUrl(employee.profileImage, "");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 pt-6">
            <Breadcrumb
                rightContent={
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => router.push(`${basePath}/employees`)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                        {isCrudAllowed && (
                            <button
                                onClick={() => router.push(`${basePath}/employees/edit/${id}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm"
                            >
                                <Edit size={18} /> Edit Profile
                            </button>
                        )}
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/90 bg-white/80 shadow-md">
                                        {profileImageUrl ? (
                                            <img
                                                src={profileImageUrl}
                                                alt={employee.firstName}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User size={48} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${derivedStatusValue === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"
                                            }`}
                                    ></span>
                                </div>
                                <div className="text-white">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-2xl font-semibold">{fullName}</h2>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                                            {derivedStatusValue}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/80">{employee.designation?.name || "No Designation"}</p>
                                    <p className="text-xs text-white/70">{employee.department?.name || "No Department"}</p>
                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/80">
                                        <span className="inline-flex items-center gap-2">
                                            <Mail size={14} /> {employee.email || "-"}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <Phone size={14} /> {employee.phone || "-"}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <MapPin size={14} /> {employee.currentAddress || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-2">
                                <div className="rounded-xl bg-white/15 px-4 py-3 text-white">
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Employee ID</p>
                                    <p className="text-sm font-semibold">{employee.employeeId || "-"}</p>
                                </div>
                                <div className="rounded-xl bg-white/15 px-4 py-3 text-white">
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Join Date</p>
                                    <p className="text-sm font-semibold">{joinDate}</p>
                                </div>
                                <div className="rounded-xl bg-white/15 px-4 py-3 text-white">
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Employment Type</p>
                                    <p className="text-sm font-semibold">{employee.employmentType || "-"}</p>
                                </div>
                                <div className="rounded-xl bg-white/15 px-4 py-3 text-white">
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Work Location</p>
                                    <p className="text-sm font-semibold">{employee.workLocation || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Highlights */}
                {(probationObj.isActive || noticeObj.isActive) && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {probationObj.isActive && !noticeObj.isActive && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-start w-full">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                                Active Probation Period
                                            </h3>
                                            <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                {probationObj.statusText}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                            This employee is currently under probation.
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">Ends On</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{probationObj.endDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">Days Remaining</p>
                                                <p className={`font-semibold ${probationObj.daysRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {probationObj.daysRemaining < 0 ? Math.abs(probationObj.daysRemaining) + ' Days Overdue' : probationObj.daysRemaining + ' Days'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {noticeObj.isActive && (
                            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start w-full">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                                Serving Notice Period
                                            </h3>
                                            <span className="text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                {noticeObj.statusText}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                            Employee has resigned and is serving notice.
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">Last Working Day</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{noticeObj.lastWorkingDay}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">Days Remaining</p>
                                                <p className={`font-semibold ${noticeObj.daysRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {noticeObj.daysRemaining < 0 ? Math.abs(noticeObj.daysRemaining) + ' Days Overdue' : noticeObj.daysRemaining + ' Days'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
                    <div className="grid auto-rows-fr gap-6 lg:col-span-2">
                        <div className="h-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                                <div className="rounded-lg bg-primary-100/70 p-2 dark:bg-primary-500/20">
                                    <User size={18} className="text-primary-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 px-6 py-5 md:grid-cols-2">
                                {personalItems.map((item) => (
                                    <div key={item.label}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                                <div className="rounded-lg bg-primary-100/70 p-2 dark:bg-primary-500/20">
                                    <Mail size={18} className="text-primary-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact Details</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 px-6 py-5 md:grid-cols-2">
                                {contactItems.map((item) => (
                                    <div key={item.label}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid auto-rows-fr gap-6">
                        <div className="h-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                                <div className="rounded-lg bg-primary-100/70 p-2 dark:bg-primary-500/20">
                                    <Briefcase size={18} className="text-primary-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Professional Details</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-y-5 px-6 py-5">
                                {professionalItems.map((item) => (
                                    <div key={item.label}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                                <div className="rounded-lg bg-primary-100/70 p-2 dark:bg-primary-500/20">
                                    <CreditCard size={18} className="text-primary-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Banking & Tax Information</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-y-5 px-6 py-5">
                                {bankingItems.map((item) => (
                                    <div key={item.label}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Detailed Sections */}
                <div className="mt-6 space-y-6">
                    {/* Family Details */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                            <div className="rounded-lg bg-emerald-100/70 p-2 dark:bg-emerald-500/20">
                                <Users size={18} className="text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Family Details</h3>
                        </div>
                        <div className="px-6 py-5">
                            {employee.familyDetails && employee.familyDetails.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {employee.familyDetails.map((member, index) => {
                                        const familyDob = member.dateOfBirth || member.dob;
                                        const familyAge = member.age || calculateFamilyAge(familyDob);

                                        return (
                                            <div key={index} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name}</p>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    <p className="text-xs text-gray-500 flex justify-between">
                                                        <span>Relation:</span>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{member.relation}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex justify-between">
                                                        <span>DOB:</span>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{formatFamilyDate(familyDob)}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex justify-between">
                                                        <span>Age:</span>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{familyAge || '-'}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex justify-between">
                                                        <span>Phone:</span>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{member.phone || '-'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No family details provided.</p>
                            )}
                        </div>
                    </div>

                    {/* Education Details */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                            <div className="rounded-lg bg-indigo-100/70 p-2 dark:bg-indigo-500/20">
                                <GraduationCap size={18} className="text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Education Details</h3>
                        </div>
                        <div className="px-6 py-5">
                            {employee.educationDetails && employee.educationDetails.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                                <th className="pb-3 font-semibold">Degree/Course</th>
                                                <th className="pb-3 font-semibold">Institute</th>
                                                <th className="pb-3 font-semibold">Year</th>
                                                <th className="pb-3 font-semibold">%/CGPA</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {employee.educationDetails.map((edu, index) => (
                                                <tr key={index}>
                                                    <td className="py-4 font-medium text-gray-900 dark:text-white">{edu.degree}</td>
                                                    <td className="py-4 text-gray-600 dark:text-gray-300">{edu.institute}</td>
                                                    <td className="py-4 text-gray-600 dark:text-gray-300">{edu.year}</td>
                                                    <td className="py-4 text-gray-600 dark:text-gray-300">{edu.percentage}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No education details provided.</p>
                            )}
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                            <div className="rounded-lg bg-amber-100/70 p-2 dark:bg-amber-500/20">
                                <Briefcase size={18} className="text-amber-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Work Experience</h3>
                        </div>
                        <div className="px-6 py-5">
                            {employee.employmentDetails && employee.employmentDetails.length > 0 ? (
                                <div className="space-y-6">
                                    {employee.employmentDetails.map((exp, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/20 mt-1.5"></div>
                                                {index !== employee.employmentDetails.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-gray-100 dark:bg-gray-700 my-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="flex flex-wrap justify-between items-start gap-2">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{exp.designation}</h4>
                                                        <p className="text-sm text-gray-500">{exp.company}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                            <CalendarDays size={12} />
                                                            {exp.from ? new Date(exp.from).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '-'} — 
                                                            {exp.to ? new Date(exp.to).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No previous employment details provided.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                        <div className="rounded-lg bg-primary-100/70 p-2 dark:bg-primary-500/20">
                            <CalendarDays size={18} className="text-primary-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Leave Balances</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {Array.isArray(leaveBalances) && leaveBalances.map((balance, index) => (
                                <div key={index} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{balance.type}</p>
                                        {balance.isBucket && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300">Bucket</span>}
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{balance.remaining}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{balance.used} Used</p>
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden dark:bg-gray-700">
                                                <div className="h-full rounded-full" style={{ width: `${Math.min((balance.used / (balance.allocated || 1)) * 100, 100)}%`, backgroundColor: balance.color || '#3b82f6' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!Array.isArray(leaveBalances) || leaveBalances.length === 0) && (
                                <p className="text-sm text-gray-500 col-span-full text-center py-4 dark:text-gray-400">No leave balances found.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary-100/70 p-2 dark:bg-primary-500/20">
                                <FileText size={18} className="text-primary-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Documents</h3>
                        </div>
                        {isCrudAllowed && (
                            <button
                                onClick={() => router.push(`${basePath}/employees/${id}/documents`)}
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                                Manage Documents →
                            </button>
                        )}
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {["AADHAAR", "PAN", "RESUME"].map((docType) => {
                                const hasDoc = documents.some((doc) => doc.type === docType);
                                return (
                                    <div
                                        key={docType}
                                        className={`rounded-xl border px-4 py-4 ${hasDoc
                                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                                            : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-lg p-2 ${hasDoc
                                                ? "bg-emerald-100 dark:bg-emerald-900/40"
                                                : "bg-amber-100 dark:bg-amber-900/40"
                                                }`}>
                                                <FileText size={18} className={hasDoc ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{docType}</p>
                                                <p className={`text-xs ${hasDoc ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                                    {hasDoc ? "Uploaded" : "Pending"}
                                                </p>
                                            </div>
                                            {hasDoc && (
                                                <div className="ml-auto flex items-center gap-2">
                                                    <a
                                                        href={documents.find(d => d.type === docType)?.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
                                                        title="View Document"
                                                    >
                                                        <Eye size={16} />
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            const doc = documents.find(d => d.type === docType);
                                                            handleDownload(doc.id, doc.name);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                                                        title="Download Document"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {documents.length === 0 && (
                            <div className="mt-4 rounded-xl bg-gray-50 py-6 text-center dark:bg-gray-900/50">
                                <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                                {isCrudAllowed && (
                                    <button
                                        onClick={() => router.push(`${basePath}/employees/${id}/documents`)}
                                        className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
                                    >
                                        Upload Documents
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
