"use client";



import { useState, useEffect } from "react";

import { TrendingUp, Loader2 } from "lucide-react";

import dynamic from 'next/dynamic';



const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });



export default function CostTrendWidget() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const timer = setTimeout(() => {

      const mockData = {

        months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],

        costs: [2100000, 2200000, 2300000, 2350000, 2400000, 2450000],

        currentMonth: 'January',

        trend: '+6.5%',

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



  const chartOptions = {

    chart: {

      type: 'line',

      toolbar: { show: false },

      fontFamily: 'inherit',

      sparkline: { enabled: false }

    },

    stroke: {

      curve: 'smooth',

      width: 2,

      colors: ['#14b8a6']

    },

    fill: {

      type: 'gradient',

      gradient: {

        shadeIntensity: 1,

        opacityFrom: 0.4,

        opacityTo: 0.1,

        stops: [0, 100],

        colorStops: [

          {

            offset: 0,

            color: '#14b8a6',

            opacity: 0.4

          },

          {

            offset: 100,

            color: '#14b8a6',

            opacity: 0.1

          }

        ]

      }

    },

    dataLabels: {

      enabled: false

    },

    xaxis: {

      categories: data.months,

      labels: {

        style: {

          colors: '#6b7280',

          fontSize: '11px',

          fontFamily: 'inherit',

        }

      },

      axisBorder: {

        show: true,

        color: '#e5e7eb',

      },

      axisTicks: {

        show: false,

      }

    },

    yaxis: {

      labels: {

        style: {

          colors: '#6b7280',

          fontSize: '11px',

          fontFamily: 'inherit',

        },

        formatter: function (val) {

          return (val / 1000000).toFixed(1) + 'M';

        }

      }

    },

    grid: {

      borderColor: '#e5e7eb',

      strokeDashArray: 3,

      xaxis: {

        lines: {

          show: true

        }

      },

      yaxis: {

        lines: {

          show: true

        }

      }

    },

    tooltip: {

      theme: 'light',

      y: {

        formatter: function (val) {

          return formatCurrency(val);

        }

      }

    },

    colors: ['#14b8a6'],

    markers: {

      size: 4,

      colors: ['#14b8a6'],

      strokeColors: '#ffffff',

      strokeWidth: 2,

      hover: {

        size: 5

      }

    }

  };



  const chartSeries = [{

    name: 'Payroll Cost',

    data: data.costs

  }];



  const latestCost = data.costs[data.costs.length - 1];

  const previousCost = data.costs[data.costs.length - 2];

  const change = ((latestCost - previousCost) / previousCost) * 100;



  return (

    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">

            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />

          </div>

          <div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Cost Trend</h3>

            <p className="text-xs text-gray-600 dark:text-gray-400">Month-on-Month Analysis</p>

          </div>

        </div>

        <div className="px-2.5 py-1 rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">

          {data.trend}

        </div>

      </div>



      <div className="space-y-4">

        {/* Current Month Stats */}

        <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">

                {data.currentMonth} 2026

              </p>

              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">

                {formatCurrency(latestCost)}

              </p>

            </div>

            <div className="text-right">

              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">vs Previous</p>

              <p className={`text-sm font-semibold ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>

                {change >= 0 ? '+' : ''}{change.toFixed(1)}%

              </p>

            </div>

          </div>

        </div>



        {/* Chart */}

        <div className="h-48 -mx-2">

          <ReactApexChart options={chartOptions} series={chartSeries} type="line" height="100%" />

        </div>



        {/* Trend Summary */}

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">

          {[

            { label: 'Lowest', value: Math.min(...data.costs) },

            { label: 'Average', value: data.costs.reduce((a, b) => a + b, 0) / data.costs.length },

            { label: 'Highest', value: Math.max(...data.costs) },

          ].map((stat) => (

            <div key={stat.label} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">

              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>

              <p className="text-sm font-semibold text-gray-900 dark:text-white">

                {formatCurrency(stat.value)}

              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

