"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Loader2, AlertCircle } from "lucide-react";
import dynamic from 'next/dynamic';
import { apiClient } from "@/lib/api";

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function CostCenterWiseWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/finance-role/payroll-cost/cost-center-breakdown");
        setData(response.data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load cost center breakdown");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </motion.div>
    );
  }
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </motion.div>
    );
  }

  if (!data || data.costCenters.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-2xl p-6 h-full premium-shadow flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">No cost center data available</p>
      </motion.div>
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
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        borderRadius: 8,
        dataLabels: {
          position: 'right',
        },
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const cost = data.costCenters[opts.dataPointIndex].cost;
        return formatCurrency(cost);
      },
      offsetX: 10,
      style: {
        fontSize: '11px',
        fontFamily: 'inherit',
        fontWeight: 600,
        colors: ['var(--foreground)']
      },
      background: {
        enabled: true,
        foreColor: 'var(--foreground)',
        padding: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'var(--border)',
        opacity: 0.9,
      }
    },
    xaxis: {
      labels: {
        style: {
          colors: 'var(--foreground)',
          fontSize: '12px',
          fontFamily: 'inherit',
        },
        formatter: function (val) {
          return (val / 100000).toFixed(0) + 'L';
        }
      },
      axisBorder: {
        show: true,
        color: 'var(--border)',
      },
      axisTicks: {
        show: true,
        color: 'var(--border)',
      }
    },
    yaxis: {
      categories: data.costCenters.map(cc => cc.name),
      labels: {
        style: {
          colors: 'var(--foreground)',
          fontSize: '12px',
          fontFamily: 'inherit',
        }
      }
    },
    grid: {
      borderColor: 'var(--border)',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
        color: 'var(--foreground)',
        background: 'var(--card)',
      },
      y: {
        formatter: function (val) {
          return formatCurrency(val);
        }
      }
    },
    colors: [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
    ],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.8,
        opacityTo: 0.6,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: 'hsl(var(--primary))',
            opacity: 0.8
          },
          {
            offset: 100,
            color: 'hsl(var(--accent))',
            opacity: 0.6
          }
        ]
      }
    }
  };

  const chartSeries = [{
    name: 'Payroll Cost',
    data: data.costCenters.map(cc => cc.cost)
  }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="glass-card glass-card-hover rounded-2xl p-6 h-full premium-shadow premium-shadow-hover relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-accent/10"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-6 relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent shadow-md border border-accent/10"
        >
          <Target className="w-6 h-6" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">Cost Center-wise Payroll Breakup</h3>
          <p className="text-sm text-muted-foreground">Cost distribution by cost center</p>
        </div>
      </motion.div>

      <div className="space-y-4 relative z-10">
        {/* Chart */}
        <div className="h-80 -mx-2">
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height="100%" />
        </div>

        {/* Cost Center List */}
        <div className="space-y-2 pt-4 border-t border-border">
          {data.costCenters.map((cc, index) => {
            const colors = [
              'hsl(var(--primary))',
              'hsl(var(--accent))',
              'hsl(var(--success))',
              'hsl(var(--warning))',
            ];
            return (
              <motion.div
                key={cc.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index] }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{cc.name}</p>
                    <p className="text-xs text-muted-foreground">{cc.employees} employees</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(cc.cost)}</p>
                  <p className="text-xs text-muted-foreground">{cc.percentage}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
