"use client";
import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import employeeService from '@/services/hr-services/employeeService';
import { payrollService } from '@/services/hr-services/payroll.service';
import { toast } from 'react-hot-toast';

const BonusForm = ({ onClose, onSuccess, initialData = null }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        employeeId: initialData?.employeeId || '',
        amount: initialData?.amount || '',
        type: initialData?.type || 'PERFORMANCE',
        paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: initialData?.description || ''
    });

    const [selectedEmployee, setSelectedEmployee] = useState(initialData?.employee || null);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getAllEmployees({ limit: 100, status: 'active' });
            const list = response.data?.employees || response.data || [];
            setEmployees(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Failed to fetch employees", error);
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employeeId || !formData.amount || !formData.paymentDate) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setSubmitting(true);
            if (initialData) {
                await payrollService.updateBonus(initialData.id, formData);
                toast.success("Bonus updated successfully");
            } else {
                await payrollService.createBonus(formData);
                toast.success("Bonus created successfully");
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to save bonus");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const empId = (emp.employeeId || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || empId.includes(query);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {initialData ? 'Edit Bonus' : 'Add New Bonus'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Employee Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Employee *
                            </label>
                            <div className="relative">
                                {selectedEmployee ? (
                                    <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {selectedEmployee.employeeId}
                                                </p>
                                            </div>
                                        </div>
                                        {!initialData && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedEmployee(null);
                                                    setFormData({ ...formData, employeeId: '' });
                                                    setSearchQuery('');
                                                }}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search employee by name or ID..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowEmployeeDropdown(true);
                                            }}
                                            onFocus={() => setShowEmployeeDropdown(true)}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                        />

                                        {showEmployeeDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                                {loading ? (
                                                    <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                                                ) : filteredEmployees.length > 0 ? (
                                                    filteredEmployees.map(emp => (
                                                        <button
                                                            key={emp.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEmployee(emp);
                                                                setFormData({ ...formData, employeeId: emp.id });
                                                                setShowEmployeeDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                    {emp.firstName} {emp.lastName}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {emp.employeeId} • {emp.designation?.name || 'No Designation'}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-center text-sm text-gray-500">No employees found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                placeholder="0.00"
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bonus Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="PERFORMANCE">Performance Bonus</option>
                                <option value="JOINING">Joining Bonus</option>
                                <option value="REFERRAL">Referral Bonus</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        {/* Payment Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Scheduled Payment Date *
                            </label>
                            <input
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                The bonus will be processed in the payroll run covering this date.
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                placeholder="Optional details..."
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Saving...' : (initialData ? 'Update Bonus' : 'Create Bonus')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BonusForm;
