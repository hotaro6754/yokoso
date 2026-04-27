"use client";

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  Laptop,
  Smartphone,
  Monitor,
  Package,
  Wrench,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Activity,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import { toast } from 'react-hot-toast';
import DashboardPunchWidget from '@/components/dashboard/DashboardPunchWidget';

export default function ITAdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    newDevices: 12,
    goodCondition: 145,
    damagedDevices: 8,
    underRepair: 5,
    retiredDevices: 3,
    totalDevices: 173,
    assignedDevices: 120,
    availableDevices: 45,
    maintenanceDevices: 5,
    recentAssignments: [
      { id: 1, device: 'LAP-001', employee: 'John Doe', date: '2026-01-24' },
      { id: 2, device: 'LAP-002', employee: 'Jane Smith', date: '2026-01-23' },
      { id: 3, device: 'MOB-001', employee: 'Mike Johnson', date: '2026-01-22' },
    ],
    pendingReturns: [
      { id: 1, device: 'LAP-015', employee: 'Sarah Wilson', returnDate: '2026-01-26' },
      { id: 2, device: 'DESK-003', employee: 'Tom Brown', returnDate: '2026-01-27' },
    ],
    maintenanceQueue: [
      { id: 1, device: 'LAP-020', issue: 'Screen flickering', status: 'In Progress', vendor: 'TechRepair Inc.' },
      { id: 2, device: 'MOB-005', issue: 'Battery replacement', status: 'In Progress', vendor: 'MobileFix' },
    ]
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await itDeviceService.getDashboardStats();
        if (res?.success) {
          setDashboardData(res.data);
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load IT dashboard');
      }
    };
    load();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const widgetCards = [
    {
      title: 'New Devices',
      value: dashboardData.newDevices,
      description: 'Never issued',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      link: '/it-admin/devices?filter=new'
    },
    {
      title: 'Good Condition',
      value: dashboardData.goodCondition,
      description: 'Working properly',
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      link: '/it-admin/devices?filter=good'
    },
    {
      title: 'Damaged Devices',
      value: dashboardData.damagedDevices,
      description: 'Requires attention',
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      link: '/it-admin/devices?filter=damaged'
    },
    {
      title: 'Under Repair',
      value: dashboardData.underRepair,
      description: 'In maintenance',
      icon: Wrench,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      link: '/it-admin/maintenance'
    },
    {
      title: 'Retired Devices',
      value: dashboardData.retiredDevices,
      description: 'Scrapped assets',
      icon: Activity,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      iconColor: 'text-gray-600 dark:text-gray-400',
      link: '/it-admin/devices?filter=retired'
    },
    {
      title: 'Missing Assets',
      value: dashboardData.missingDevices,
      description: 'Lost or stolen',
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      link: '/it-admin/missing-assets'
    },
    {
      title: 'Total Devices',
      value: dashboardData.totalDevices,
      description: 'All assets',
      icon: Laptop,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      link: '/it-admin/devices'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: "IT Admin", href: "/it-admin" },
            { label: "Dashboard", href: "/it-admin/dashboard" },
          ]}
        />

        <div className="mb-8">
          <DashboardPunchWidget />
        </div>

        {/* Header */}
        <div className="mt-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{currentDate}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <Activity size={18} className="text-[hsl(var(--primary))]" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {dashboardData.underRepair + dashboardData.damagedDevices} Issues
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {widgetCards.map((widget, index) => {
            const Icon = widget.icon;
            return (
              <Link
                key={index}
                href={widget.link}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${widget.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {widget.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {widget.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {widget.description}
                    </p>
                  </div>
                  <div className={`p-3 ${widget.bgColor} rounded-xl`}>
                    <Icon className={`h-6 w-6 ${widget.iconColor}`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Device Status Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Status Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[hsl(var(--primary))]/10 rounded-xl">
                    <Activity className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Device Status Overview
                  </h2>
                </div>
                <Link
                  href="/it-admin/devices"
                  className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {dashboardData.assignedDevices}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {dashboardData.availableDevices}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maintenance</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {dashboardData.maintenanceDevices}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Retired</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {dashboardData.retiredDevices}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Assignments */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[hsl(var(--primary))]/10 rounded-xl">
                    <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Recent Assignments
                  </h2>
                </div>
                <Link
                  href="/it-admin/assignments"
                  className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {dashboardData.recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[hsl(var(--primary))]/10 rounded-lg">
                        <Laptop className="h-4 w-4 text-[hsl(var(--primary))]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {assignment.device}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {assignment.employee}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(assignment.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Alerts */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[hsl(var(--primary))]/10 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="space-y-3">
                <Link
                  href="/it-admin/devices/add"
                  className="flex items-center gap-3 p-3 bg-[hsl(var(--primary))]/10 hover:bg-[hsl(var(--primary))]/20 rounded-xl transition-all group"
                >
                  <div className="p-2 bg-[hsl(var(--primary))] rounded-lg">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[hsl(var(--primary))]">
                      Add New Device
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Register asset
                    </p>
                  </div>
                </Link>
                <Link
                  href="/it-admin/assignments/new"
                  className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all group"
                >
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                      Assign Device
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Assign to employee
                    </p>
                  </div>
                </Link>
                <Link
                  href="/it-admin/maintenance"
                  className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all group"
                >
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600">
                      Maintenance Queue
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dashboardData.underRepair} devices
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Pending Returns */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[hsl(var(--primary))]/10 rounded-xl">
                  <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pending Returns
                </h2>
              </div>
              <div className="space-y-3">
                {dashboardData.pendingReturns.map((returnItem) => (
                  <div
                    key={returnItem.id}
                    className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {returnItem.device}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {returnItem.employee}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Due: {new Date(returnItem.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <Link
                  href="/it-admin/returns"
                  className="block text-center text-sm font-semibold text-[hsl(var(--primary))] hover:underline pt-2"
                >
                  View All Returns →
                </Link>
              </div>
            </div>

            {/* Maintenance Queue */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[hsl(var(--primary))]/10 rounded-xl">
                  <Wrench className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Maintenance Queue
                </h2>
              </div>
              <div className="space-y-3">
                {dashboardData.maintenanceQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {item.device}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {item.issue}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.vendor}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  href="/it-admin/maintenance"
                  className="block text-center text-sm font-semibold text-[hsl(var(--primary))] hover:underline pt-2"
                >
                  View All →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
