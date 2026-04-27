// src/app/(dashboard)/hr/payroll/salary-structure/components/SalaryStructureForm.js
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, IndianRupee, Plus, Trash2 } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';
import { employeeService } from '@/services/hr-services/employeeService';

export default function SalaryStructureForm({ structure = null, isEdit = false }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: '',
        basicSalary: 0,
        allowances: [{ name: '', amount: 0 }],
        deductions: [{ name: '', amount: 0 }],
        effectiveDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);
                const response = await employeeService.getAllEmployees();
                setEmployees(response.data || []);
            } catch (err) {
                console.error('Error fetching employees:', err);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (structure) {
            setFormData({
                employeeId: structure.employeeId || '',
                basicSalary: structure.basicSalary || 0,
                allowances: structure.allowances?.length > 0 ? structure.allowances : [{ name: '', amount: 0 }],
                deductions: structure.deductions?.length > 0 ? structure.deductions : [{ name: '', amount: 0 }],
                effectiveDate: structure.effectiveDate ? new Date(structure.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: structure.status || 'ACTIVE',
            });
        }
    }, [structure]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basicSalary' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleArrayChange = (type, index, field, value) => {
        const newArray = [...formData[type]];
        newArray[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [type]: newArray }));
    };

    const addArrayItem = (type) => {
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], { name: '', amount: 0 }]
        }));
    };

    const removeArrayItem = (type, index) => {
        const newArray = formData[type].filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            [type]: newArray.length > 0 ? newArray : [{ name: '', amount: 0 }]
        }));
    };

    const calculateTotal = (type) => {
        return formData[type].reduce((sum, item) => sum + (item.amount || 0), 0);
    };

    const totalCTC = formData.basicSalary + calculateTotal('allowances') - calculateTotal('deductions');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isEdit) {
                await payrollService.updateSalaryStructure(structure.id, formData);
            } else {
                await payrollService.createSalaryStructure(formData);
            }
            router.push('/hr/payroll/salary-structure');
            router.refresh();
        } catch (error) {
            alert('Error saving salary structure: ' + error.message);
            console.error('Error saving salary structure:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full p-4 sm:p-6 text-left">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.push('/hr/payroll/salary-structure')}
                    className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Salary Structure' : 'Add New Salary Structure'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isEdit ? 'Update employee salary components' : 'Set up initial salary components for an employee'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Employee *
                            </label>
                            <select
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                                required
                                disabled={isEdit}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Effective Date *
                            </label>
                            <input
                                type="date"
                                name="effectiveDate"
                                value={formData.effectiveDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Basic Salary *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <input
                                    type="number"
                                    name="basicSalary"
                                    value={formData.basicSalary}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                                required
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Allowances Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Allowances</h3>
                            <button
                                type="button"
                                onClick={() => addArrayItem('allowances')}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Plus size={16} /> Add
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.allowances.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <input
                                        placeholder="E.g. HRA"
                                        value={item.name}
                                        onChange={(e) => handleArrayChange('allowances', index, 'name', e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <div className="relative w-32">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-xs">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={item.amount}
                                            onChange={(e) => handleArrayChange('allowances', index, 'amount', e.target.value)}
                                            className="w-full pl-5 pr-2 py-2 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('allowances', index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between font-semibold">
                                <span>Total Allowances</span>
                                <span className="text-blue-600">₹{calculateTotal('allowances').toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Deductions</h3>
                            <button
                                type="button"
                                onClick={() => addArrayItem('deductions')}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Plus size={16} /> Add
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.deductions.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <input
                                        placeholder="E.g. PF"
                                        value={item.name}
                                        onChange={(e) => handleArrayChange('deductions', index, 'name', e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <div className="relative w-32">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-xs">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={item.amount}
                                            onChange={(e) => handleArrayChange('deductions', index, 'amount', e.target.value)}
                                            className="w-full pl-5 pr-2 py-2 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('deductions', index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between font-semibold">
                                <span>Total Deductions</span>
                                <span className="text-red-600">₹{calculateTotal('deductions').toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold opacity-90">Estimated Total Monthly CTC</h3>
                        <p className="text-xs opacity-75">Basic + Total Allowances - Total Deductions</p>
                        <div className="mt-2 text-3xl font-bold">
                            ₹{totalCTC.toLocaleString()}
                        </div>
                    </div>
                    <div className="flex-1 mt-6 md:mt-0 md:border-l border-blue-400 md:pl-6">
                        <h3 className="text-lg font-semibold opacity-90">Estimated Total Yearly CTC</h3>
                        <p className="text-xs opacity-75">Monthly CTC × 12</p>
                        <div className="mt-2 text-3xl font-bold">
                            ₹{(totalCTC * 12).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/hr/payroll/salary-structure')}
                        className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Saving...' : (isEdit ? 'Update Structure' : 'Create Structure')}
                    </button>
                </div>
            </form>
        </div>
    );
}
