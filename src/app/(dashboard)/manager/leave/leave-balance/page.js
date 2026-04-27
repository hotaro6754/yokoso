"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "@/app/(dashboard)/employee/leave/components/BreadcrumbRightContent";
import LeaveBalanceCard from "@/app/(dashboard)/employee/leave/components/LeaveBalanceCard";
import LeaveOverviewCards from "@/app/(dashboard)/employee/leave/components/LeaveOverviewCards";
import EmployeeLeaveService from "@/services/employee/leave.service";

export default function LeaveBalancePage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      const response = await EmployeeLeaveService.getLeaveBalance();
      const data = response.leaveTypes || response || [];
      const allowedTypes = ['casual', 'sick', 'earned', 'emergency'];
      const filteredData = data.filter(leave => {
        const name = (leave.type || leave.name || leave.leaveType || "").toLowerCase();
        return allowedTypes.some(type => name.includes(type));
      });
      setLeaveData(filteredData);
    } catch (error) {
      console.error("Failed to fetch leave balance", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="Leave Balance"
          subtitle="Check your remaining leave days"
          rightContent={
            <BreadcrumbRightContent
              selectedDate={selectedMonth}
              setSelectedDate={setSelectedMonth}
            />
          }
        />

        <LeaveOverviewCards selectedMonth={selectedMonth} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 animate-pulse"></div>
            ))
          ) : (
            leaveData.length > 0 ? (
              leaveData.map((leave, index) => (
                <LeaveBalanceCard
                  key={index}
                  type={leave.type || leave.name || leave.leaveType}
                  allocated={leave.allocated ?? leave.total}
                  used={leave.used ?? 0}
                />
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No leave balance data available</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
