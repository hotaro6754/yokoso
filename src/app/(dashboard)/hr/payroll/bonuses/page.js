"use client";
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';
import BonusForm from './components/BonusForm';
import Pagination from '@/components/common/Pagination';
import Breadcrumb from '@/components/common/Breadcrumb';
import { toast } from 'react-hot-toast';

export default function BonusesPage() {
    const [bonuses, setBonuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingBonus, setEditingBonus] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchBonuses();
    }, [currentPage, itemsPerPage, search, statusFilter, typeFilter]);

    const fetchBonuses = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search,
                status: statusFilter,
                type: typeFilter
            };
            const response = await payrollService.getBonuses(params);

            if (response && response.bonuses) {
                setBonuses(response.bonuses);
                setTotalItems(response.pagination?.total || 0);
            } else {
                setBonuses([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error("Failed to fetch bonuses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this bonus?")) return;
        try {
            await payrollService.deleteBonus(id);
            toast.success("Bonus deleted successfully");
            fetchBonuses();
        } catch (error) {
            toast.error(error.message || "Failed to delete bonus");
        }
    };

    const handleEdit = (bonus) => {
        setEditingBonus(bonus);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingBonus(null);
    };

    const getStatusBadge = (isPaid) => {
        if (isPaid) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle size={12} /> Paid
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock size={12} /> Pending
            </span>
        );
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'PERFORMANCE': return 'Performance';
            case 'JOINING': return 'Joining';
            case 'REFERRAL': return 'Referral';
            default: return 'Other';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <Breadcrumb
                    items={[
                        { label: 'HR', href: '/hr' },
                        { label: 'Payroll', href: '/hr/payroll' },
                        { label: 'Bonuses' }
                    ]}
                />
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                    <Plus size={18} />
                    Add Bonus
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by employee name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Pending</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="PERFORMANCE">Performance</option>
                            <option value="JOINING">Joining</option>
                            <option value="REFERRAL">Referral</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading bonuses...</div>
                ) : bonuses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {bonuses.map((bonus) => (
                                    <tr key={bonus.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {bonus.employee?.firstName} {bonus.employee?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {bonus.employee?.employeeId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {getTypeLabel(bonus.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                                                {payrollService.formatCurrency(bonus.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(bonus.paymentDate).toLocaleDateString()}
                                            </div>
                                            {bonus.payrollRun && (
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    Run: {new Date(0, bonus.payrollRun.month - 1).toLocaleString('default', { month: 'short' })} {bonus.payrollRun.year}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(bonus.isPaid)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!bonus.isPaid && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(bonus)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600 dark:text-blue-400"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bonus.id)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No bonuses found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filters, or add a new bonus.
                        </p>
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

            {showForm && (
                <BonusForm
                    onClose={handleFormClose}
                    onSuccess={() => {
                        fetchBonuses();
                        toast.success(editingBonus ? "Bonus updated" : "Bonus created");
                    }}
                    initialData={editingBonus}
                />
            )}
        </div>
    );
}
