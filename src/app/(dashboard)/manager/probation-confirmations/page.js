"use client";

import { useEffect, useState, useMemo } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  UserCheck,
  ClipboardList,
  CheckCircle2,
  CalendarClock,
  XCircle,
  MessageSquareText,
  Target,
  FileText,
  BarChart,
  AlertTriangle,
  History
} from "lucide-react";
import { managerProbationService } from "@/services/manager-services/probation-confirmations.service";
import { toast } from "react-hot-toast";

export default function ManagerProbationConfirmationsPage() {
  const [items, setItems] = useState([]);
  const [selectedProbationId, setSelectedProbationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "Probation & Confirmations", href: "/manager/probation-confirmations" },
  ];

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await managerProbationService.getList();
      setItems(data);
      console.log('List data:', data);
    } catch (err) {
      setError(err?.message || "Unable to load probation reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const summary = useMemo(() => {
    // Logic based on item status or deadlines
    // Mocking for now as backend 'status' field might differ
    return {
      active: items.filter(i => i.status === 'ACTIVE').length,
      extended: items.filter(i => i.status === 'EXTENDED').length,
      completed: items.filter(i => i.status === 'COMPLETED').length
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase">Active Probation</p>
          <p className="text-2xl font-bold">{summary.active}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase">Extended</p>
          <p className="text-2xl font-bold text-amber-600">{summary.extended}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.completed}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">Team Probation Status</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
            <tr className="border-b border-primary-100 dark:border-primary-800">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Current Stage</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(item => (
              <tr key={item.probationId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.email}</p>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(item.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                    {item.currentStage?.replace('DAYS_', '')} Days
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'EXTENDED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedProbationId(item.probationId)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-end gap-1 w-full"
                  >
                    <ClipboardList size={16} /> Manage
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No active probation records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProbationId && (
        <ProbationManagementModal
          probationId={selectedProbationId}
          onClose={() => { setSelectedProbationId(null); fetchReviews(); }}
        />
      )}
    </div>
  );
}

function ProbationManagementModal({ probationId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Forms
  const [goals, setGoals] = useState([{ title: "", description: "", kpiType: "QUANTITATIVE", targetValue: "", weightage: "", dueStage: "DAYS_30" }]);
  const [reviewForm, setReviewForm] = useState({ reviewStage: "DAYS_30", performanceRating: "MEETS_EXPECTATIONS", potentialRating: "MEDIUM", comments: "" });
  const [decisionForm, setDecisionForm] = useState({ action: "CONFIRM", extendWeeks: 4, notes: "" });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await managerProbationService.getDetails(probationId);
      setDetails(data);
      // Logic to set default tab or form values based on data
      if (data.goals.length === 0) setActiveTab('goals');
    } catch (error) {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (probationId) fetchDetails();
  }, [probationId]);

  const handleAddGoal = () => {
    setGoals([...goals, { title: "", description: "", kpiType: "QUANTITATIVE", targetValue: "", weightage: "", dueStage: "DAYS_30" }]);
  };

  const handleRemoveGoal = (index) => {
    const newGoals = [...goals];
    newGoals.splice(index, 1);
    setGoals(newGoals);
  };

  const handleGoalChange = (index, field, value) => {
    const newGoals = [...goals];
    newGoals[index][field] = value;
    setGoals(newGoals);
  };

  const submitGoals = async () => {
    try {
      await managerProbationService.initiateGoals(probationId, goals);
      toast.success("Goals initiated!");
      fetchDetails();
      setActiveTab("overview");
    } catch (error) {
      toast.error("Failed to submit goals");
    }
  };

  const submitReview = async () => {
    try {
      await managerProbationService.submitReview(probationId, reviewForm);
      toast.success("Review submitted!");
      fetchDetails();
      setActiveTab("overview");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const submitDecision = async () => {
    try {
      await managerProbationService.submitDecision(probationId, decisionForm);
      toast.success("Decision recorded!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit decision");
    }
  };

  if (!probationId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {details?.employee?.user?.firstName}'s Probation
            </h3>
            <p className="text-sm text-gray-500">Managed by you</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white">
          {['overview', 'goals', 'review'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? "border-primary-600 text-primary-700 bg-primary-50/10" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {loading ? <div className="text-center py-10">Loading...</div> : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status Overview */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-xl border shadow-sm">
                      <p className="text-xs text-gray-500 uppercase">Stage</p>
                      <p className="font-bold text-lg">{details?.currentStage?.replace('DAYS_', '')} Days</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border shadow-sm">
                      <p className="text-xs text-gray-500 uppercase">Reviews</p>
                      <p className="font-bold text-lg">{details?.reviews?.length} / 3</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border shadow-sm">
                      <p className="text-xs text-gray-500 uppercase">Auto-Confirm</p>
                      <p className={`font-bold text-lg ${details?.autoConfirmationEligible ? "text-emerald-600" : "text-gray-400"}`}>
                        {details?.autoConfirmationEligible ? "Eligible" : "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* Recent Activities / Reviews */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><History size={18} /> Review History</h4>
                    {details?.reviews?.length === 0 ? <p className="text-gray-500 italic text-sm">No reviews submitted yet.</p> : (
                      <div className="space-y-3">
                        {details.reviews.map(rev => (
                          <div key={rev.id} className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {rev.reviewStage}
                                </span>
                                <p className="mt-1 font-medium text-sm">{rev.performanceRating}</p>
                              </div>
                              <span className="text-xs text-gray-400">{new Date(rev.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{rev.managerComments}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Final Decision Area */}
                  <div className="bg-white border-t-4 border-t-primary-500 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-lg mb-4">Final Decision</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Action</label>
                        <select
                          className="w-full border rounded p-2"
                          value={decisionForm.action}
                          onChange={e => setDecisionForm({ ...decisionForm, action: e.target.value })}
                        >
                          <option value="CONFIRM">Confirm Employment</option>
                          <option value="EXTEND">Extend Probation</option>
                          <option value="TERMINATE">Terminate</option>
                        </select>
                      </div>
                      {decisionForm.action === 'EXTEND' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Extension (Weeks)</label>
                          <select
                            className="w-full border rounded p-2"
                            value={decisionForm.extendWeeks}
                            onChange={e => setDecisionForm({ ...decisionForm, extendWeeks: parseInt(e.target.value) })}
                          >
                            {[1, 2, 3, 4].map(w => <option key={w} value={w}>{w} Weeks</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <textarea
                      className="w-full border rounded p-3 text-sm h-24 mb-4"
                      placeholder="Reason for decision / Notes..."
                      value={decisionForm.notes}
                      onChange={e => setDecisionForm({ ...decisionForm, notes: e.target.value })}
                    />
                    <button
                      onClick={submitDecision}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 w-full md:w-auto"
                    >
                      Submit Decision
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'goals' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                    <div className="flex gap-2 items-center text-blue-800">
                      <AlertTriangle size={18} />
                      <p className="text-sm font-medium">Define clear, measurable goals for {details?.employee?.user?.firstName}.</p>
                    </div>
                    <button onClick={handleAddGoal} className="text-sm bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded shadow-sm font-medium hover:bg-blue-50">+ Add Goal</button>
                  </div>

                  {goals.map((goal, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border shadow-sm space-y-3 relative group">
                      <button onClick={() => handleRemoveGoal(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={18} /></button>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Goal Title</label>
                          <input
                            value={goal.title}
                            onChange={e => handleGoalChange(idx, 'title', e.target.value)}
                            className="w-full border-b border-gray-200 focus:border-primary-500 outline-none py-1 text-sm font-medium"
                            placeholder="Enter goal title..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Due Stage</label>
                          <select
                            value={goal.dueStage}
                            onChange={e => handleGoalChange(idx, 'dueStage', e.target.value)}
                            className="w-full border-b border-gray-200 focus:border-primary-500 outline-none py-1 text-sm bg-transparent"
                          >
                            <option value="DAYS_30">30 Days</option>
                            <option value="DAYS_60">60 Days</option>
                            <option value="DAYS_90">90 Days</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                        <textarea
                          value={goal.description}
                          onChange={e => handleGoalChange(idx, 'description', e.target.value)}
                          className="w-full border rounded bg-gray-50 p-2 text-sm mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">KPI Type</label>
                          <select
                            value={goal.kpiType}
                            onChange={e => handleGoalChange(idx, 'kpiType', e.target.value)}
                            className="w-full border rounded p-1 text-xs mt-1"
                          >
                            <option value="QUANTITATIVE">Quantitative</option>
                            <option value="QUALITATIVE">Qualitative</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Target Value</label>
                          <input
                            value={goal.targetValue}
                            onChange={e => handleGoalChange(idx, 'targetValue', e.target.value)}
                            className="w-full border rounded p-1 text-xs mt-1"
                            placeholder="e.g. 10 Leads"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Weight (%)</label>
                          <input type="number"
                            value={goal.weightage}
                            onChange={e => handleGoalChange(idx, 'weightage', e.target.value)}
                            className="w-full border rounded p-1 text-xs mt-1"
                            placeholder="25"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={submitGoals}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 shadow-md transform active:scale-95 transition-all"
                    >
                      Save & Initiate Goals
                    </button>
                  </div>

                  {/* Existing Goals Display */}
                  {details?.goals?.length > 0 && (
                    <div className="mt-8 border-t pt-6">
                      <h4 className="font-bold text-gray-800 mb-3">Existing Goals</h4>
                      <div className="space-y-2">
                        {details.goals.map(g => (
                          <div key={g.id} className="p-3 bg-gray-100 rounded border flex justify-between items-center opacity-75">
                            <span className="font-medium text-sm">{g.goalTitle}</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{g.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'review' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Submit Feedback</h4>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-600">Review Stage</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-gray-50"
                          value={reviewForm.reviewStage}
                          onChange={e => setReviewForm({ ...reviewForm, reviewStage: e.target.value })}
                        >
                          <option value="DAYS_30">30 Days Review</option>
                          <option value="DAYS_60">60 Days Review</option>
                          <option value="DAYS_90">90 Days Review</option>
                        </select>
                      </div>
                      <div>
                        {/* KPI/Goal Review Section could go here - simple text for now */}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-emerald-600">Performance Rating</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-emerald-50 border-emerald-100"
                          value={reviewForm.performanceRating}
                          onChange={e => setReviewForm({ ...reviewForm, performanceRating: e.target.value })}
                        >
                          <option value="MEETS_EXPECTATIONS">Meets Expectations</option>
                          <option value="EXCEEDS_EXPECTATIONS">Exceeds Expectations</option>
                          <option value="BELOW_EXPECTATIONS">Below Expectations</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-indigo-600">Potential Rating</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-indigo-50 border-indigo-100"
                          value={reviewForm.potentialRating}
                          onChange={e => setReviewForm({ ...reviewForm, potentialRating: e.target.value })}
                        >
                          <option value="HIGH">High Potential</option>
                          <option value="MEDIUM">Medium Potential</option>
                          <option value="LOW">Low Potential</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2 text-gray-600">Manager Comments (Mandatory)</label>
                      <textarea
                        className="w-full border rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-primary-100 outline-none"
                        placeholder="Provide detailed feedback on performance, strengths, and areas for improvement..."
                        value={reviewForm.comments}
                        onChange={e => setReviewForm({ ...reviewForm, comments: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={submitReview}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transform hover:-translate-y-1 transition-all"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
