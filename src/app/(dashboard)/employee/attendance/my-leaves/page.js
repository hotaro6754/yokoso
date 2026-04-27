"use client";

import { useState, useMemo } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "../components/BreadcrumbRightContent";
import Pagination from "@/components/common/Pagination";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import LeavesStatsCards from "../components/LeavesStatsCards";
import { Search, Filter, X, Calendar, ChevronUp, ChevronDown, CheckCircle, Clock, AlertCircle, User, FileText, Plus, BarChart3 } from "lucide-react";


// --- Dummy leave data
const leaveData = [
  { id: "L-001", date: "01 Sep 2025", type: "Sick", duration: "Full Day", status: "Approved", reason: "Fever", approvedBy: "HR" },
  { id: "L-002", date: "05 Sep 2025", type: "Casual", duration: "Half Day", status: "Pending", reason: "Personal", approvedBy: "Manager" },
  { id: "L-003", date: "12 Sep 2025", type: "Earned", duration: "Full Day", status: "Rejected", reason: "Vacation", approvedBy: "HR" },
  { id: "L-004", date: "20 Sep 2025", type: "Sick", duration: "Half Day", status: "Approved", reason: "Cold", approvedBy: "Manager" },
  { id: "L-005", date: "25 Sep 2025", type: "Casual", duration: "Full Day", status: "Approved", reason: "Personal", approvedBy: "Manager" },
];

// --- Filters component
function LeaveFilters({ monthFilter, setMonthFilter, typeFilter, setTypeFilter, statusFilter, setStatusFilter, onClearFilters }) {
  const months = ["All","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const types = ["All","Casual","Sick","Earned"];
  const statuses = ["All","Pending","Approved","Rejected"];
  const hasActiveFilters = monthFilter !== "All" || typeFilter !== "All" || statusFilter !== "All";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-primary-100/50 dark:border-gray-700 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Month Filter */}
          <div className="relative flex-1 lg:flex-initial min-w-[120px]">
            <select 
              className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              value={monthFilter} 
              onChange={e => setMonthFilter(e.target.value)}
            >
              {months.map(m => <option key={m} value={m}>{m === "All" ? "All Months" : m}</option>)}
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Type Filter */}
          <div className="relative flex-1 lg:flex-initial min-w-[120px]">
            <select 
              className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
            >
              {types.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
            </select>
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 lg:flex-initial min-w-[120px]">
            <select 
              className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {hasActiveFilters && (
          <button 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
            onClick={onClearFilters}
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

// --- Attractive Apply Leave Form
function ApplyLeaveForm({ onSubmit }) {
  const [type, setType] = useState("Casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("Full Day");
  const [reason, setReason] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ id: `L-${Math.floor(Math.random()*1000)}`, date: startDate, type, duration, status: "Pending", reason, approvedBy: "-" });
    setType("Casual"); setStartDate(""); setEndDate(""); setDuration("Full Day"); setReason("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
          <Plus size={18} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Apply for Leave</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Leave Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leave Type</label>
          <select
            className="px-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="Casual">Casual</option>
            <option value="Sick">Sick</option>
            <option value="Earned">Earned</option>
          </select>
        </div>

        {/* Duration */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
          <select
            className="px-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          >
            <option value="Full Day">Full Day</option>
            <option value="Half Day">Half Day</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
          <input
            type="date"
            className="px-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
          <input
            type="date"
            className="px-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Reason */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
        <textarea
          className="px-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm resize-none min-h-[80px]"
          placeholder="Enter reason for leave..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Submit Leave Request
      </button>
    </form>
  );
}


// --- Main Leaves Page
export default function MyLeaves() {
  const [data, setData] = useState(leaveData);
  const [monthFilter, setMonthFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredData = useMemo(() => data.filter(l => {
    const monthMatch = monthFilter === "All" || new Date(l.date).toLocaleString('default', { month: 'short' }) === monthFilter;
    const typeMatch = typeFilter === "All" || l.type === typeFilter;
    const statusMatch = statusFilter === "All" || l.status === statusFilter;
    return monthMatch && typeMatch && statusMatch;
  }), [data, monthFilter, typeFilter, statusFilter]);

  const columns = useMemo(() => [
    { 
      accessorKey: "date", 
      header: "Date",
      enableSorting: true,
      cell: info => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">{info.getValue()}</span>
        </div>
      )
    },
    { 
      accessorKey: "type", 
      header: "Type",
      enableSorting: true,
      cell: info => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">{info.getValue()}</span>
      )
    },
    { 
      accessorKey: "duration", 
      header: "Duration",
      enableSorting: true,
      cell: info => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary-500" />
          <span className="text-gray-600 dark:text-gray-400">{info.getValue()}</span>
        </div>
      )
    },
    { 
      accessorKey: "status", 
      header: "Status",
      enableSorting: true,
      cell: info => {
        const s = info.getValue();
        const statusConfig = {
          "Approved": { bg: "bg-primary-50 dark:bg-primary-500/10", text: "text-primary-700 dark:text-primary-400", border: "border-primary-200 dark:border-primary-500/30", icon: CheckCircle },
          "Pending": { bg: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-500/30", icon: Clock },
          "Rejected": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30", icon: AlertCircle },
        };
        const config = statusConfig[s] || { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", icon: AlertCircle };
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            <Icon size={12} />
            {s}
          </span>
        );
      }
    },
    { 
      accessorKey: "reason", 
      header: "Reason",
      enableSorting: true,
      cell: info => (
        <span className="text-gray-600 dark:text-gray-400">{info.getValue()}</span>
      )
    },
    { 
      accessorKey: "approvedBy", 
      header: "Approved By",
      enableSorting: true,
      cell: info => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-primary-500" />
          <span className="text-gray-600 dark:text-gray-400">{info.getValue()}</span>
        </div>
      )
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination, sorting, globalFilter },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
  });

  const handleAddLeave = leave => setData([leave, ...data]);

  const chartData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    
    // Calculate data for each month
    const chartDataArray = months.map(month => {
      const monthData = data.filter(d => 
        new Date(d.date).toLocaleString('default',{ month: 'short'}) === month
      );
      
      return {
        month,
        total: monthData.length,
        casual: monthData.filter(d => d.type === "Casual").length,
        sick: monthData.filter(d => d.type === "Sick").length,
        earned: monthData.filter(d => d.type === "Earned").length,
      };
    });
    
    return chartDataArray;
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          title="My Leaves"
          subtitle="View and manage your leave requests"
          rightContent={<BreadcrumbRightContent />}
        />

        <LeavesStatsCards selectedMonth={new Date().toLocaleString('default', { month: 'long' })} />

        {/* Apply Leave Form */}
        <ApplyLeaveForm onSubmit={handleAddLeave} />

        <LeaveFilters
          monthFilter={monthFilter} 
          setMonthFilter={setMonthFilter}
          typeFilter={typeFilter} 
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter} 
          setStatusFilter={setStatusFilter}
          onClearFilters={() => { 
            setMonthFilter("All"); 
            setTypeFilter("All"); 
            setStatusFilter("All"); 
            setPagination({ pageIndex: 0, pageSize: 10 });
          }}
        />

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-primary-50/50 to-primary-50/30 dark:from-gray-800 dark:to-gray-800 border-b border-primary-100/50 dark:border-gray-700">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                          header.column.getCanSort() ? 'cursor-pointer hover:bg-primary-50/50 dark:hover:bg-gray-700/50 transition-colors' : ''
                        }`}
                        {...(header.column.getCanSort() ? { onClick: header.column.getToggleSortingHandler() } : {})}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown size={14} />
                              ) : (
                                <div className="flex flex-col -space-y-1">
                                  <ChevronUp size={10} className="text-gray-300" />
                                  <ChevronDown size={10} className="text-gray-300" />
                                </div>
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-primary-100/30 dark:divide-gray-700">
                {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-primary-50/30 dark:hover:bg-gray-700/30 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-5 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <FileText size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No leave records found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalItems={filteredData.length}
          itemsPerPage={pagination.pageSize}
          onPageChange={page => table.setPageIndex(page - 1)}
          onItemsPerPageChange={size => { 
            table.setPageSize(size); 
            table.setPageIndex(0);
            setPagination({ pageIndex: 0, pageSize: size });
          }}
          className="mt-6"
        />

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Leaves Overview</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly leave trends</p>
              </div>
            </div>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCasual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary) / 0.6)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(var(--primary) / 0.6)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary) / 0.4)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary) / 0.4)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(0, 0, 0, 0.05)" 
                  vertical={false}
                  className="dark:stroke-gray-700"
                />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  className="dark:stroke-gray-400"
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  className="dark:stroke-gray-400"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                  itemStyle={{
                    color: '#6b7280',
                    padding: '4px 0'
                  }}
                  formatter={(value, name) => [`${value} leave${value !== 1 ? 's' : ''}`, name]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5, stroke: "#fff" }}
                  activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  name="Total Leaves"
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="casual"
                  stroke="hsl(var(--primary) / 0.8)"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorCasual)"
                  dot={{ fill: "hsl(var(--primary) / 0.8)", strokeWidth: 2, r: 4, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary) / 0.8)", strokeWidth: 2 }}
                  name="Casual Leaves"
                  animationDuration={1000}
                  animationBegin={100}
                />
                <Area
                  type="monotone"
                  dataKey="sick"
                  stroke="#facc15"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSick)"
                  dot={{ fill: "#facc15", strokeWidth: 2, r: 4, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#facc15", strokeWidth: 2 }}
                  name="Sick Leaves"
                  animationDuration={1000}
                  animationBegin={200}
                />
                <Area
                  type="monotone"
                  dataKey="earned"
                  stroke="hsl(var(--primary) / 0.5)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEarned)"
                  dot={{ fill: "hsl(var(--primary) / 0.5)", strokeWidth: 2, r: 4, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary) / 0.5)", strokeWidth: 2 }}
                  name="Earned Leaves"
                  animationDuration={1000}
                  animationBegin={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
