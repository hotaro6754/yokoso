// src/app/(dashboard)/hr/payroll/salary-structure/edit/[id]/page.js
"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import SalaryStructureForm from '../../components/SalaryStructureForm';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function EditSalaryStructurePage() {
    const { id } = useParams();
    const [structure, setStructure] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStructure = async () => {
            try {
                setLoading(true);
                const response = await payrollService.getSalaryStructureById(id);
                setStructure(response.data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching salary structure:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStructure();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mt-20"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
            <Breadcrumb pageTitle="Edit Salary Structure" />
            <div className="mt-6">
                <SalaryStructureForm structure={structure} isEdit={true} />
            </div>
        </div>
    );
}
