"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { hrProbationService } from "@/services/hr-services/probation.service";
import Breadcrumb from "@/components/common/Breadcrumb";
import { FileText, Calendar, CheckCircle, AlertCircle, User, Mail, Briefcase, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function HRProbationDetailsPage() {
    const { id } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const data = await hrProbationService.getDetails(id);
            setDetails(data);
        } catch (err) {
            toast.error("Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = [
        { label: "Performance", href: "/hr/performance-management" },
        { label: "Probation Management", href: "/hr/performance/probation" },
        { label: details ? details.employee?.name : "Details", href: `/hr/performance/probation/${id}` },
    ];

    if (loading) return <div className="p-10 text-center text-gray-500">Loading details...</div>;
    if (!details) return <div className="p-10 text-center text-rose-500">Record not found</div>;

    const emp = details.employee || {};

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Header / Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-center">
                        <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center text-2xl font-bold">
                            {emp.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{emp.name}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Briefcase size={14} /> {emp.designation || 'N/A'}</span>
                                <span className="flex items-center gap-1"><Building2 size={14} /> {emp.department || 'N/A'}</span>
                                <span className="flex items-center gap-1"><Mail size={14} /> {emp.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                                ${details.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' :
                                    details.status === 'EXTENDED' ? 'bg-amber-50 text-amber-700' :
                                        details.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {details.status}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">Stage: {details.currentStage?.replace('DAYS_', '')} Days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl px-4 pt-2">
                {['overview', 'goals', 'reviews', 'surveys'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-t-0 border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">

                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4">Probation Details</h3>
                            <div className="space-y-4">
                                <DetailRow label="Start Date" value={new Date(details.startDate).toLocaleDateString()} icon={<Calendar size={16} />} />
                                <DetailRow label="End Date" value={new Date(details.endDate).toLocaleDateString()} icon={<Calendar size={16} />} />
                                <DetailRow label="Original End Date" value={new Date(details.originalEndDate).toLocaleDateString()} icon={<Calendar size={16} />} />
                                <DetailRow label="Duration" value={`${details.probationDays} Days`} />
                                <DetailRow label="Auto Confirmation" value={details.autoEligible ? "Enabled" : "Disabled"} />
                                <DetailRow label="Reporting Manager" value={emp.reportingManager} icon={<User size={16} />} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4">Extension History</h3>
                            {details.extensions?.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">No extensions recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {details.extensions.map((ext, idx) => (
                                        <div key={ext.id} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-semibold text-amber-800">Extension #{idx + 1}</span>
                                                <span className="text-amber-600">{new Date(ext.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p><span className="font-medium">New End Date:</span> {new Date(ext.extensionEnd).toLocaleDateString()}</p>
                                                {ext.notes && <p className="mt-1"><span className="font-medium">Reason:</span> {ext.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'goals' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Performance Goals</h3>
                        {details.goals?.length === 0 ? (
                            <p className="text-gray-500">No goals set yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Title</th>
                                            <th className="px-4 py-3">KPI Type</th>
                                            <th className="px-4 py-3">Target</th>
                                            <th className="px-4 py-3">Weight</th>
                                            <th className="px-4 py-3">Due Stage</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {details.goals.map(goal => (
                                            <tr key={goal.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{goal.goalTitle}</td>
                                                <td className="px-4 py-3">{goal.kpiType}</td>
                                                <td className="px-4 py-3">{goal.targetValue || '-'}</td>
                                                <td className="px-4 py-3">{goal.weightage ? `${goal.weightage}%` : '-'}</td>
                                                <td className="px-4 py-3 text-xs uppercase">{goal.dueStage?.replace('DAYS_', '')} Days</td>
                                                <td className="px-4 py-3">
                                                    {goal.status === 'ACKNOWLEDGED' ? (
                                                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> Acknowledged</span>
                                                    ) : (
                                                        <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={14} /> Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Manager Reviews</h3>
                        {details.reviews?.length === 0 ? (
                            <p className="text-gray-500">No reviews submitted yet.</p>
                        ) : (
                            <div className="space-y-6">
                                {details.reviews.map(review => (
                                    <div key={review.id} className="p-4 border rounded-xl">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-gray-800">{review.reviewStage?.replace('DAYS_', '')} Days Review</h4>
                                            <span className="text-sm text-gray-500">{new Date(review.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
                                            <div>
                                                <p className="text-xs text-gray-500">Performance</p>
                                                <p className="font-semibold">{review.performanceRating?.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Potential</p>
                                                <p className="font-semibold">{review.potentialRating}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-1">Manager Comments:</p>
                                            <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">{review.managerComments || 'No comments'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'surveys' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Employee Experience Surveys</h3>
                        {details.surveys?.length === 0 ? (
                            <p className="text-gray-500">No surveys submitted by employee yet.</p>
                        ) : (
                            <div className="space-y-6">
                                {details.surveys.map(survey => (
                                    <div key={survey.id} className="p-4 border rounded-xl bg-purple-50/30 border-purple-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-gray-800">{survey.stage?.replace('DAYS_', '')} Days Survey</h4>
                                            <span className="text-sm text-gray-500">{new Date(survey.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Role Clarity:</span>
                                                <RatingStars rating={survey.roleClarityRating} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Manager Support:</span>
                                                <RatingStars rating={survey.managerSupportRating} />
                                            </div>
                                        </div>
                                        <div className="space-y-3 mt-3 border-t pt-3">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">Experience Feedback</p>
                                                <p className="text-sm text-gray-700">{survey.experienceFeedback || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">Suggestions</p>
                                                <p className="text-sm text-gray-700">{survey.suggestions || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value, icon }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-sm flex items-center gap-2">{icon} {label}</span>
            <span className="font-medium text-gray-900 text-sm">{value || '-'}</span>
        </div>
    );
}

function RatingStars({ rating }) {
    return (
        <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={i < rating ? "fill-current" : "text-gray-300"}>★</span>
            ))}
        </div>
    );
}
