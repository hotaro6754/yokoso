"use client";
import { useState, useEffect } from 'react';
import { RefreshCw, Calendar, Clock, MapPin, Plus, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SwapRequestModal from './components/SwapRequestModal';
import { employeeShiftService } from '@/services/employee/shift.service';

// Ensure Send icon is available
const SendIcon = Send;

export default function EmployeeShiftPage() {
  const [shifts, setShifts] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [swapsLoading, setSwapsLoading] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const fetchRoster = async () => {
    setLoading(true);
    try {
        const res = await employeeShiftService.getMyRoster(selectedMonth, selectedYear);
        if(res.success) setShifts(res.data || []);
    } catch(err) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  const fetchSwapRequests = async () => {
    setSwapsLoading(true);
    try {
      const res = await employeeShiftService.getMySwapRequests();
      if(res.success) setSwapRequests(res.data || []);
    } catch(err) {
      console.error("Failed to fetch swap requests", err);
    } finally {
      setSwapsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
    fetchSwapRequests();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="p-4 sm:p-6 space-y-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Shift Roster</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View your schedule and manage swap requests.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/employee/shift-management/swap-request"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
          >
            <SendIcon size={18} /> New Swap Request
          </a>
        </div>
       </div>

       {/* Month Filter */}
       <div className="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={16} /> Period:
            </span>
            <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-sm border-gray-200 dark:border-gray-700 rounded-lg py-1.5 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
            >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', { month: 'short' })}</option>
                ))}
            </select>
            <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-sm border-gray-200 dark:border-gray-700 rounded-lg py-1.5 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
            >
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
       </div>

       {/* Roster Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {!loading && shifts.length > 0 ? shifts.map((shift, idx) => (
               <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 dark:bg-brand-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                   
                   <div className="relative">
                       <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                               {new Date(shift.date).getDate()}
                           </div>
                           <div>
                               <p className="text-xs font-medium text-gray-500 uppercase">{new Date(shift.date).toLocaleString('default', { weekday: 'long' })}</p>
                               <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(shift.date).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                           </div>
                       </div>
                       
                       <div className="space-y-3">
                           <div className="flex items-center gap-3 text-sm">
                               <Clock className="w-4 h-4 text-gray-400" />
                               <span className="font-medium text-gray-700 dark:text-gray-300">{shift.timing}</span>
                               <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono">{shift.shiftCode}</span>
                           </div>
                           <div className="flex items-center gap-3 text-sm">
                               <MapPin className="w-4 h-4 text-gray-400" />
                               <span className="text-gray-600 dark:text-gray-400">{shift.location}</span>
                           </div>
                       </div>
                   </div>
               </div>
           )) : (
               <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                   {loading ? "Loading roster..." : "No shifts assigned for this month."}
               </div>
           )}
       </div>

       {/* Swap Requests Section */}
       <section>
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <RefreshCw className="w-5 h-5 text-brand-500" /> My Swap Requests
           </h2>
         </div>

         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden text-nowrap xl:text-wrap">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 dark:bg-gray-700/50">
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Colleague</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Shifts</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                   <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                 {!swapsLoading && swapRequests.length > 0 ? swapRequests.map((req) => (
                   <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                     <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                       {new Date(req.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </td>
                     <td className="px-6 py-4">
                       <div className="text-sm font-medium text-gray-900 dark:text-white">{req.peerName}</div>
                       <div className="text-xs text-gray-500">{req.peerDept}</div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">Me: {req.requesterShift}</span>
                          <RefreshCw className="w-3 h-3 text-gray-400" />
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded">Them: {req.peerShift}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                         req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                         req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                         'bg-yellow-100 text-yellow-700'
                       }`}>
                         {req.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                       {req.reason}
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                       {swapsLoading ? "Loading swap requests..." : "No swap requests found."}
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>
       </section>

       <SwapRequestModal 
         isOpen={isSwapModalOpen}
         onClose={() => setIsSwapModalOpen(false)}
         onSuccess={() => { fetchRoster(); fetchSwapRequests(); }}
       />
    </div>
  );
}
