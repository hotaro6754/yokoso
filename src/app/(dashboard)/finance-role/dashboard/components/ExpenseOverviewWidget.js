"use client";



import { useState, useEffect } from "react";

import { Receipt, Clock, CheckCircle2, Loader2 } from "lucide-react";



export default function ExpenseOverviewWidget() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const timer = setTimeout(() => {

      const mockData = {

        pendingApprovals: 12,

        approvedThisMonth: 45,

        totalApprovedAmount: 125000,

        pendingAmount: 35000,

      };

      setData(mockData);

      setLoading(false);

    }, 500);



    return () => clearTimeout(timer);

  }, []);



  if (loading) {

    return (

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm h-full flex items-center justify-center">

        <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />

      </div>

    );

  }



  const formatCurrency = (amount) => {

    return new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,

    }).format(amount);

  };



  return (

    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">

          <Receipt className="w-5 h-5 text-primary-600 dark:text-primary-400" />

        </div>

        <div className="flex-1">

          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Expense Overview</h3>

          <p className="text-xs text-gray-600 dark:text-gray-400">Current Month Status</p>

        </div>

      </div>



      <div className="space-y-4">

        {/* Pending Approvals */}

        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20">

          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-3">

              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">

                <Clock className="w-4 h-4" />

              </div>

              <div>

                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Pending Approvals</p>

                <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting review</p>

              </div>

            </div>

          </div>

          <div className="flex items-end justify-between">

            <div>

              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">

                {data.pendingApprovals}

              </p>

              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">

                {formatCurrency(data.pendingAmount)} pending

              </p>

            </div>

            <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-medium transition-colors">

              Review

            </button>

          </div>

        </div>



        {/* Approved Expenses */}

        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20">

          <div className="flex items-center gap-3 mb-3">

            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">

              <CheckCircle2 className="w-4 h-4" />

            </div>

            <div>

              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Approved Expenses</p>

              <p className="text-xs text-gray-500 dark:text-gray-400">Current month</p>

            </div>

          </div>

          <div className="space-y-2">

            <div className="flex items-end justify-between">

              <p className="text-2xl font-bold text-green-600 dark:text-green-400">

                {data.approvedThisMonth}

              </p>

              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">expenses</span>

            </div>

            <p className="text-base font-semibold text-gray-900 dark:text-white">

              {formatCurrency(data.totalApprovedAmount)}

            </p>

          </div>

        </div>



        {/* Quick Stats */}

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">

          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">

            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Expenses</p>

            <p className="text-base font-semibold text-gray-900 dark:text-white">

              {data.pendingApprovals + data.approvedThisMonth}

            </p>

          </div>

          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">

            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>

            <p className="text-base font-semibold text-primary-600 dark:text-primary-400">

              {formatCurrency(data.totalApprovedAmount + data.pendingAmount)}

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

