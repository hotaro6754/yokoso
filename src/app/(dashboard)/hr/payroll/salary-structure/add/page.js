// src/app/(dashboard)/hr/payroll/salary-structure/add/page.js
"use client";
import Breadcrumb from '@/components/common/Breadcrumb';
import SalaryStructureForm from '../components/SalaryStructureForm';

export default function AddSalaryStructurePage() {
    return (
        <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
            <Breadcrumb pageTitle="Add Salary Structure" />
            <div className="mt-6">
                <SalaryStructureForm />
            </div>
        </div>
    );
}
