"use client";

import { useEffect, useState } from "react";
import EmployeeLeaveService from "@/services/employee/leave.service";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "./components/BreadcrumbRightContent";
import LeaveOverviewCards from "./components/LeaveOverviewCards";
import LeaveRequestForm from "./components/RequestLeaveForm";
import LeaveHistoryTable from "./components/LeaveHistoryTable";
import RequestEncashmentModal from "./components/RequestEncashmentModal";
import EncashmentHistoryTable from "./components/EncashmentHistoryTable";
import { Banknote } from "lucide-react";
import { userService } from "@/services/user-services/user.service";

export default function LeaveDashboardPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEncashModalOpen, setIsEncashModalOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await userService.getProfile();
            if (response.success) {
                setUserProfile(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 transition-colors duration-200">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/employee/dashboard" },
                        { label: "Leave Management" },
                    ]}
                    rightContent={
                        <BreadcrumbRightContent
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                        />
                    }
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="rounded-sm border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500 flex-1">
                        <div className="flex gap-2 text-xs text-blue-800 dark:text-blue-300">
                            <span className="font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">Policy Note:</span>
                            <span>You are eligible for 10 holidays plus leave as per company policy. Leaves (ELs) are accrued monthly.</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEncashModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900/50 rounded-sm text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-sm hover:shadow-md flex-shrink-0"
                    >
                        <Banknote size={16} />
                        Encash Leave
                    </button>
                </div>

                <LeaveOverviewCards selectedMonth={selectedDate} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                                    Request Leave
                                </h3>
                            </div>
                            <div className="p-4">
                                <LeaveRequestForm compact={true} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* Leave History */}
                        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                                    Recent History
                                </h3>
                                <a href="/employee/leave/leave-history" className="text-xs font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wide">
                                    View All
                                </a>
                            </div>
                            <div className="flex-1">
                                <LeaveHistoryTable limit={5} compact={true} />
                            </div>
                        </div>

                        {/* Encashment Requests */}
                        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
                                <Banknote size={16} className="text-emerald-600" />
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                                    Encashment History
                                </h3>
                            </div>
                            <EncashmentHistoryTable limit={5} />
                        </div>
                    </div>
                </div>
            </div>

            <RequestEncashmentModal
                isOpen={isEncashModalOpen}
                onClose={() => setIsEncashModalOpen(false)}
                userProfile={userProfile}
            />
        </div>
    );
}
