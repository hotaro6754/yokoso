"use client";



import { useState, useEffect } from "react";

import { Loader2 } from "lucide-react";

import dynamic from 'next/dynamic';



const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });



export default function PayrollCostSummaryWidget() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const timer = setTimeout(() => {

      const mockData = {

        totalPayrollCost: 2450000,

        earnings: 2850000,

        deductions: 400000,

        netPayout: 2450000,

        previousMonth: 2300000,

      };

      setData(mockData);

      setLoading(false);

    }, 500);



    return () => clearTimeout(timer);

  }, []);



  if (loading) {

    return (

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-full flex items-center justify-center">

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



  // Calculate percentages

  const total = data.earnings + data.deductions;

  const earningsPercent = Math.round((data.earnings / total) * 100);

  const deductionsPercent = Math.round((data.deductions / total) * 100);



  const chartOptions = {

    chart: {

      type: 'donut',

      fontFamily: 'Inter, sans-serif',

      toolbar: { show: false },

    },

    labels: ['Earnings', 'Deductions'],

    colors: ['#10b981', '#ef4444'],

    plotOptions: {

      pie: {

        donut: {

          size: '70%',

        },

        expandOnClick: false,

      }

    },

    dataLabels: {

      enabled: true,

      formatter: function(val) {

        return Math.round(val) + '%';

      },

      style: {

        fontSize: '14px',

        fontFamily: 'Inter, sans-serif',

        fontWeight: 600,

        colors: ['#ffffff'],

      },

      dropShadow: {

        enabled: false,

      },

    },

    legend: {

      show: true,

      position: 'bottom',

      horizontalAlign: 'center',

      fontSize: '13px',

      fontFamily: 'Inter, sans-serif',

      fontWeight: 500,

      markers: {

        width: 8,

        height: 8,

        radius: 4,

      },

      itemMargin: {

        horizontal: 16,

        vertical: 8

      },

      labels: {

        colors: '#1f2937',

      }

    },

    tooltip: {

      enabled: false

    },

    stroke: {

      show: false,

    },

    states: {

      hover: {

        filter: {

          type: 'none',

        }

      }

    }

  };



  const chartSeries = [data.earnings, data.deductions];



  return (

    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">

      <div className="space-y-6">

        {/* Total Amount at Top */}

        <div className="bg-primary-100 dark:bg-primary-500/20 rounded-lg p-4 border border-primary-200 dark:border-primary-500/30">

          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">

            {formatCurrency(data.netPayout)}

          </p>

        </div>



        {/* Earnings vs Deductions Section */}

        <div className="space-y-4">

          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Earnings vs Deductions</h4>

          

          {/* Donut Chart */}

          <div className="flex items-center justify-center -mx-4">

            <div className="w-full max-w-sm">

              <ReactApexChart 

                options={chartOptions} 

                series={chartSeries} 

                type="donut" 

                height={280}

              />

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

