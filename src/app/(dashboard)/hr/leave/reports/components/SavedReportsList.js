"use client";
import { useState, useEffect } from 'react';
import { Bookmark, Trash2, Clock, Calendar, Download, Loader2 } from 'lucide-react';
import { leaveReportsService } from '@/services/hr-services/leaveReports.service';

const SavedReportsList = ({ onApplyReport }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSavedReports();
    }, []);

    const fetchSavedReports = async () => {
        try {
            setLoading(true);
            const response = await leaveReportsService.getSavedReports();
            setReports(response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching saved reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
            await leaveReportsService.deleteSavedReport(id);
            setReports(reports.filter(r => r.id !== id));
        } catch (err) {
            alert('Failed to delete report: ' + err.message);
        }
    };

    if (loading && reports.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (reports.length === 0 && !loading) {
        return null; // Don't show anything if no saved reports
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Saved Reports
                </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg">
                                <Clock size={18} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span>{JSON.stringify(report.filters)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onApplyReport(report.filters)}
                                className="px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={() => handleDelete(report.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete Report"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedReportsList;
