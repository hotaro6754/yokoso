"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import helpdeskService from "@/services/helpdesk.service";
import HRMSLoader from "@/components/common/HRMSLoader";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { 
  ArrowLeft, Clock, MessageSquare, User, Send, 
  CheckCircle, AlertCircle, Calendar, Building,
  Tag, Paperclip, MoreVertical, Shield, Info, UserPlus
} from "lucide-react";

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const payrollPrefix = pathname?.startsWith('/payroll') ? '/payroll' : '';
  const ldPrefix = pathname?.startsWith('/ld') ? '/ld' : '';
  const deptHeadPrefix = pathname?.startsWith('/dept-head') ? '/dept-head' : '';
  const financePrefix = pathname?.startsWith('/finance-role') ? '/finance-role' : '';
  const managerPrefix = pathname?.startsWith('/manager') ? '/manager' : '';
  const itAdminPrefix = pathname?.startsWith('/it-admin') ? '/it-admin' : '';
  const helpdeskBase = `${payrollPrefix || ldPrefix || deptHeadPrefix || financePrefix || managerPrefix || itAdminPrefix}/helpdesk`;

  const userRole = user?.systemRole || 'EMPLOYEE';
  const isAgentOrAdmin = ['HR_ADMIN', 'IT_ADMIN', 'FINANCE_ADMIN', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER', 'DEPT_HEAD'].includes(userRole);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleClaim = async () => {
    try {
      await helpdeskService.claimTicket(id);
      toast.success("Ticket assigned to you");
      fetchTicket();
    } catch (error) {
      toast.error("Failed to assign ticket");
    }
  };

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await helpdeskService.getTicketById(id);
      setTicket(res.data);
    } catch (error) {
      console.error("Failed to fetch ticket", error);
      toast.error("Failed to load ticket details");
      router.push(helpdeskBase);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await helpdeskService.addComment(id, { comment });
      setComment("");
      toast.success("Comment added");
      fetchTicket();
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = () => {
    setIsResolveModalOpen(true);
  };

  const onConfirmResolve = async () => {
    try {
      await helpdeskService.resolveTicket(id, { resolutionSummary: "Resolved via dashboard" });
      toast.success("Ticket resolved");
      fetchTicket();
      setIsResolveModalOpen(false);
    } catch (error) {
      toast.error("Failed to resolve ticket");
    }
  };

  if (loading) return <HRMSLoader text="Fetching ticket details..." variant="fullscreen" />;
  if (!ticket) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="w-full space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push(helpdeskBase)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>

          <div className="flex items-center gap-3">
             {isAgentOrAdmin && !ticket.assignedToId && (ticket.status === 'NEW' || ticket.status === 'IN_PROGRESS') && (
               <button 
                onClick={handleClaim}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
               >
                 <UserPlus size={16} /> Assign to me
               </button>
             )}
             {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
               <button 
                onClick={handleResolve}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
               >
                 <CheckCircle size={16} /> Resolve Ticket
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content: Thread & Details */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Ticket Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">{ticket.ticketId}</span>
                       <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                       </span>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{ticket.subject}</h1>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-sm border border-gray-200 dark:border-gray-700">
                    <Calendar size={14} />
                    {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
               </div>

               <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/30 p-4 rounded-sm border border-gray-100 dark:border-gray-700/50">
                {ticket.description}
               </p>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 px-1">
                  <MessageSquare size={18} className="text-brand-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Conversation Thread</h3>
               </div>

               <div className="space-y-6">
                  {ticket.comments?.map((c, idx) => (
                    <div key={idx} className={`flex gap-4 ${c.author?.id === ticket.employee?.id ? 'flex-row' : 'flex-row'}`}>
                       <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                          <User size={20} className="text-gray-500" />
                       </div>
                       <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                             <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {c.author?.firstName} {c.author?.lastName}
                                {c.author?.systemRole && <span className="ml-2 text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-400">{c.author.systemRole}</span>}
                             </span>
                             <span className="text-[11px] text-gray-400">
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                             {c.comment}
                          </div>
                       </div>
                    </div>
                  ))}

                  {/* Reply Box */}
                  <div className="flex gap-4 pt-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                      <MessageSquare size={18} className="text-brand-600" />
                    </div>
                    <form onSubmit={handleAddComment} className="flex-1 space-y-4">
                       <textarea 
                        rows={3}
                        placeholder="Write your response here..."
                        className="w-full p-4 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-0 transition-all outline-none text-sm"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                       />
                       <div className="flex items-center justify-between">
                          <button type="button" className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors bg-white dark:bg-gray-800 px-3 py-2 rounded-sm border border-gray-200 dark:border-gray-700">
                             <Paperclip size={14} /> Attach File
                          </button>
                          <button 
                            type="submit"
                            disabled={!comment.trim() || isSubmitting}
                            className="bg-brand-600 text-white px-6 py-2.5 rounded-sm font-medium text-sm flex items-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50"
                          >
                             {isSubmitting ? "Posting..." : <><Send size={16} /> Post Response</>}
                          </button>
                       </div>
                    </form>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar: Metadata & Info */}
          <div className="space-y-6">
             
             {/* Ticket Info Card */}
             <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                   <h3 className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Ticket Information</h3>
                </div>
                <div className="p-4 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                        <Building size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide">Department</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{ticket.department?.name}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-500">
                        <Tag size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide">Category</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{ticket.category?.name}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide">Priority</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{ticket.priority}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide">SLA Deadline</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {new Date(ticket.slaDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Assigned Agent Card */}
             <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                   <h3 className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Support Agent</h3>
                </div>
                <div className="p-4">
                   {ticket.assignedTo ? (
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
                           {ticket.assignedTo.firstName?.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</p>
                           <p className="text-xs text-gray-400">Assigned Agent</p>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <Shield size={28} className="text-gray-300" />
                        <p className="text-sm text-gray-500">No agent assigned yet</p>
                     </div>
                   )}
                </div>
             </div>

          </div>

        </div>
      </div>

      <ConfirmationDialog
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={onConfirmResolve}
        title="Resolve Ticket?"
        message="Are you sure you want to mark this ticket as resolved? This will notify the employee."
        confirmText="Resolve Now"
        cancelText="Cancel"
      />
    </div>
  );
}
