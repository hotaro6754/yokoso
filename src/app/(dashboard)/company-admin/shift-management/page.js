"use client";
import { useState, useEffect } from 'react';
import { Upload, Bell, CheckCircle, XCircle, Calendar, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImportShiftModal from './components/ImportShiftModal';
import ConfirmationModal from './components/ConfirmationModal';
import AssignShiftModal from './components/AssignShiftModal';
import { shiftManagementService } from '@/services/manager-services/shiftManagement.service';
import { workforceService } from '@/services/hr-services/workforce.service';
import { employeeService } from '@/services/hr-services/employeeService';

// Utility for classNames
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ShiftManagementPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('roster');
  const [shifts, setShifts] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'roster') {
        const res = await workforceService.getShiftAssignments({ month: selectedMonth, year: selectedYear });
        console.log('Shifts API Response:', res);
        let data = [];
        if (Array.isArray(res)) {
          data = res;
        } else if (res?.success && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        }
        
        setShifts(data);
      } else {
        const res = await shiftManagementService.getSwapRequests();
        if (res.success) setRequests(res.data || []);
      }
      
      // Fetch Team Members for dropdown if not already fetched
      if (teamMembers.length === 0) {
        const teamRes = await employeeService.getAllEmployees();
        const members = teamRes?.data || teamRes || [];
        setTeamMembers(members);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedMonth, selectedYear]);

  const handlePublish = () => {
    setIsPublishConfirmOpen(true);
  };

  const confirmPublish = async () => {
     try {
       await shiftManagementService.publishRoster(selectedMonth, selectedYear);
       toast.success("Roster Published Successfully");
     } catch (error) {
       toast.error(error.message);
     }
  };

  const handleSwapAction = async (id, action) => {
    try {
      await shiftManagementService.actionSwapRequest(id, action);
      toast.success(`Request ${action}ed`);
      fetchData(); // Refresh
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage monthly rosters and swap requests for all employees.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsAssignModalOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-200"
           >
             <Calendar size={16} /> Assign Shift
           </button>
           <button 
             onClick={() => setIsImportModalOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-200"
           >
             <Upload size={16} /> Import Roster
           </button>
           <button 
             onClick={handlePublish}
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
           >
             <Bell size={16} /> Publish & Notify
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['roster', 'approvals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                activeTab === tab
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors'
              )}
            >
              {tab === 'roster' ? 'Monthly Roster' : 'Swap Requests'}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">
        
        {/* Filters for Roster */}
        {activeTab === 'roster' && (
           <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4 items-center bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                 <Calendar size={16} className="text-gray-500" />
                 <select 
                   value={selectedMonth} 
                   onChange={(e) => setSelectedMonth(Number(e.target.value))}
                   className="text-sm border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 >
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                       <option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                 </select>
                 <select 
                   value={selectedYear} 
                   onChange={(e) => setSelectedYear(Number(e.target.value))}
                   className="text-sm border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 >
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
              </div>
              <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors">
                 <RefreshCcw size={16} className={`text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
           </div>
        )}

        {/* Table Roster */}
        {activeTab === 'roster' && (
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-900/50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shift</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {!loading && shifts.length > 0 ? shifts.map((shift) => (
                   <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{shift.employeeName}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{shift.date}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                          {shift.shift} ({shift.workLocation})
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{shift.location}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                         <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle size={14} /> Published
                         </span>
                     </td>
                   </tr>
                 )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                         {loading ? "Loading roster..." : "No shifts found for this month. Please import a roster."}
                      </td>
                    </tr>
                 )}
               </tbody>
             </table>
           </div>
        )}

        {/* Table Approvals */}
        {activeTab === 'approvals' && (
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-900/50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requestor</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Swap Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Shift</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Swap With</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proposed Shift</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {!loading && requests.length > 0 ? requests.map((req) => (
                   <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {req.requesterName}
                        <div className="text-xs text-gray-500 dark:text-gray-400">{req.requesterCode}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.date}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.requesterShift}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {req.peerName}
                        <div className="text-xs text-gray-500 dark:text-gray-400">{req.peerCode}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.peerShift}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.reason}</td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <span className={classNames(
                          "px-2.5 py-1 rounded-full text-xs font-bold",
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        )}>
                          {req.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                       <div className="flex justify-center gap-2">
                         {req.status === 'PENDING' ? (
                           <>
                             <button 
                               onClick={() => handleSwapAction(req.id, 'APPROVE')}
                               className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 transition-colors"
                               title="Approve"
                             >
                               <CheckCircle size={20} />
                             </button>
                             <button 
                               onClick={() => handleSwapAction(req.id, 'REJECT')}
                               className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
                               title="Reject"
                             >
                               <XCircle size={20} />
                             </button>
                           </>
                         ) : (
                           <span className="text-gray-400 text-xs italic">Completed</span>
                         )}
                       </div>
                     </td>
                   </tr>
                 )) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                         {loading ? "Loading requests..." : "No pending approvals."}
                      </td>
                    </tr>
                 )}
               </tbody>
             </table>
           </div>
        )}
      </div>

      <ImportShiftModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
           setIsImportModalOpen(false);
           fetchData();
        }}
        teamMembers={teamMembers}
      />
      
      <AssignShiftModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
           setIsAssignModalOpen(false);
           fetchData();
        }}
        teamMembers={teamMembers}
      />

      <ConfirmationModal
        isOpen={isPublishConfirmOpen}
        onClose={() => setIsPublishConfirmOpen(false)}
        onConfirm={confirmPublish}
        title="Publish Roster"
        message={`Are you sure you want to publish the roster for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}? This will trigger notifications for all employees.`}
        confirmText="Publish & Notify"
      />
    </div>
  );
}
