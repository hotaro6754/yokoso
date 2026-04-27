"use client";



import { useState, useEffect } from "react";

import { FileCheck, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";



export default function PayoutReadinessWidget() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const timer = setTimeout(() => {

      const mockData = {

        payrollApproved: true,

        bankFileGenerated: true,

        approvedDate: new Date().toISOString(),

        bankFileDate: new Date().toISOString(),

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



  const formatDate = (dateString) => {

    return new Date(dateString).toLocaleDateString('en-IN', {

      day: '2-digit',

      month: 'short',

      year: 'numeric'

    });

  };



  return (

    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">

          <FileCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />

        </div>

        <div className="flex-1">

          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payout Readiness</h3>

          <p className="text-xs text-gray-600 dark:text-gray-400">Payment Status Check</p>

        </div>

      </div>



      <div className="space-y-4">

        {/* Payroll Approved Status */}

        <div className={`p-4 rounded-lg border ${

          data.payrollApproved

            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'

            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'

        }`}>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className={`p-2 rounded-lg ${

                data.payrollApproved

                  ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'

                  : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'

              }`}>

                {data.payrollApproved ? (

                  <CheckCircle2 className="w-4 h-4" />

                ) : (

                  <XCircle className="w-4 h-4" />

                )}

              </div>

              <div>

                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Payroll Approved</p>

                <p className="text-xs text-gray-500 dark:text-gray-400">

                  {data.payrollApproved ? 'Ready for payout' : 'Pending approval'}

                </p>

              </div>

            </div>

            <span className={`px-2.5 py-1 rounded text-xs font-medium ${

              data.payrollApproved

                ? 'bg-green-600 text-white'

                : 'bg-red-600 text-white'

            }`}>

              {data.payrollApproved ? 'YES' : 'NO'}

            </span>

          </div>

          {data.payrollApproved && (

            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">

              Approved on {formatDate(data.approvedDate)}

            </p>

          )}

        </div>



        {/* Bank File Generated Status */}

        <div className={`p-4 rounded-lg border ${

          data.bankFileGenerated

            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'

            : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'

        }`}>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className={`p-2 rounded-lg ${

                data.bankFileGenerated

                  ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'

                  : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'

              }`}>

                {data.bankFileGenerated ? (

                  <CheckCircle2 className="w-4 h-4" />

                ) : (

                  <AlertCircle className="w-4 h-4" />

                )}

              </div>

              <div>

                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Bank File Generated</p>

                <p className="text-xs text-gray-500 dark:text-gray-400">

                  {data.bankFileGenerated ? 'File ready for upload' : 'File generation pending'}

                </p>

              </div>

            </div>

            <span className={`px-2.5 py-1 rounded text-xs font-medium ${

              data.bankFileGenerated

                ? 'bg-green-600 text-white'

                : 'bg-yellow-600 text-white'

            }`}>

              {data.bankFileGenerated ? 'YES' : 'NO'}

            </span>

          </div>

          {data.bankFileGenerated && (

            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">

              Generated on {formatDate(data.bankFileDate)}

            </p>

          )}

        </div>



        {/* Overall Status */}

        <div className={`p-4 rounded-lg border ${

          data.payrollApproved && data.bankFileGenerated

            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'

            : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'

        }`}>

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Overall Status</p>

              <p className={`text-lg font-bold ${

                data.payrollApproved && data.bankFileGenerated

                  ? 'text-green-600 dark:text-green-400'

                  : 'text-yellow-600 dark:text-yellow-400'

              }`}>

                {data.payrollApproved && data.bankFileGenerated

                  ? 'Ready for Payout'

                  : 'Action Required'}

              </p>

            </div>

            {data.payrollApproved && data.bankFileGenerated && (

              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">

                <CheckCircle2 className="w-5 h-5" />

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

