"use client";
import { useState, useEffect } from 'react';
import { Download, FileDown, Calendar, Search } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import Pagination from '@/components/common/Pagination';
import { toast } from 'react-hot-toast';

export default function BankTransferPage() {
    const [exports, setExports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
    const [format, setFormat] = useState('CSV');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchExports();
    }, [currentPage, itemsPerPage]);

    const fetchExports = async () => {
        try {
            setLoading(true);
            const response = await payrollService.getBankExports({
                page: currentPage,
                limit: itemsPerPage
            });

            const list = response.exports || response.data?.exports || [];
            setExports(Array.isArray(list) ? list : []);
            setTotalItems(response.pagination?.totalItems || response.data?.pagination?.totalItems || 0);
        } catch (error) {
            console.error("Failed to fetch bank exports", error);
            toast.error("Failed to load export history");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            const blob = await payrollService.downloadBankExport(id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || `bank_export_${id}.csv`); // Default name
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to download file");
        }
    };

    const handleGenerateExport = async () => {
        try {
            setGenerating(true);
            const result = await payrollService.generateBankExport({
                exportType: 'PAYROLL',
                format,
                exportDate
            });

            toast.success("Bank export generated successfully");
            fetchExports();

            // Auto-download if possible or show link
            if (result.downloadPath || result.id) {
                await handleDownload(result.id, result.fileName);
            }
        } catch (error) {
            toast.error(error.message || "Failed to generate export");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
            <Breadcrumb
                items={[
                    { label: 'HR', href: '/hr' },
                    { label: 'Payroll', href: '/hr/payroll' },
                    { label: 'Bank Transfer' }
                ]}
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Generate Export Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Generate Bank File
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={exportDate}
                                        onChange={(e) => setExportDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Exports salaries scheduled for this date.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    File Format
                                </label>
                                <select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="CSV">CSV</option>
                                    <option value="XLSX">Excel</option>
                                    <option value="TXT">Text File</option>
                                </select>
                            </div>

                            <button
                                onClick={handleGenerateExport}
                                disabled={generating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {generating ? 'Generating...' : (
                                    <>
                                        <FileDown size={18} />
                                        Generate & Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Export History
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading history...</div>
                        ) : exports.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">To Account</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {exports.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.fileName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {item.account || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                                                    {payrollService.formatCurrency(item.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => handleDownload(item.id, item.fileName)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1"
                                                    >
                                                        <Download size={14} /> Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No export history found.
                            </div>
                        )}

                        {!loading && totalItems > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
