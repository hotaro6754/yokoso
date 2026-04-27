'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast'; // Using react-hot-toast as per project standards
import { payrollService } from '@/services/hr-services/payroll.service';
import { authService } from '@/services/auth-services/authService';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PayslipViewPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const runId = searchParams.get('runId');
    const [loading, setLoading] = useState(true);
    const [payslips, setPayslips] = useState([]);
    const [shop, setShop] = useState(null);

    useEffect(() => {
        if (!runId) {
            toast.error("Invalid Payroll Run ID");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch payroll items for the run
                const itemsResponse = await payrollService.getPayrollItems(runId, { limit: 1000 }); // Fetch all
                const items = itemsResponse.data || itemsResponse.items || [];

                // Fetch company details
                let shopData = {};
                try {
                    const authPayload = await authService.getCurrentUser();
                    // Expected payload structure: { success: true, data: { user: { company: {...} } } }
                    const user = authPayload.data?.user || authPayload.user;
                    const company = user?.company;

                    if (company) {
                        shopData = {
                            name: company.name,
                            address: company.address,
                            phone: company.phone,
                            email: company.contactEmail,
                            gst: company.gstNumber
                        };
                    }
                } catch (err) {
                    console.error("Failed to fetch company details for payslip header", err);
                }
                setShop(shopData);

                // Map items to the format required by the template
                const mappedPayslips = items.map(item => {
                    const earnings = item.earnings || {};
                    const deductions = item.deductions || {};
                    const attendanceStats = earnings._attendanceStats || {};
                    
                    const filteredEarnings = Object.fromEntries(
                        Object.entries(earnings).filter(([key]) => key !== '_attendanceStats')
                    );

                    const totalAllowances = Object.values(filteredEarnings).reduce((a, b) => a + (Number(b) || 0), 0);
                    const totalDeductions = Object.values(deductions).reduce((a, b) => a + (Number(b) || 0), 0) + (Number(item.manualDeductions) || 0);

                    return {
                        id: item.id,
                        month: item.payrollRun?.period || (new Date().toLocaleString('default', { month: 'long', year: 'numeric' })),
                        payment_date: item.payrollRun?.paymentDate,
                        emp_id: item.employee?.employeeId || 'N/A',
                        payroll_id: item.payrollRun?.payrollId || `RUN-${runId}`,
                        full_name: `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`.trim(),
                        role: item.employee?.designation?.name || item.employee?.designation || 'Staff',
                        working_days: attendanceStats.workingDays ?? (item.attendance?.workingDays || 30),
                        present_days: attendanceStats.presentDays ?? (item.attendance?.presentDays || 0),
                        absent_days: attendanceStats.absentDays ?? (item.attendance?.absentDays || 0),
                        status: item.status || 'PROCESSED',
                        basic_salary: Number(item.basicSalary) || 0,
                        allowances: totalAllowances,
                        deductions: totalDeductions,
                        net_salary: Number(item.netSalary) || 0,
                        payment_method: 'Bank Transfer',
                        bank_account: item.employee?.accountNumber || '****',
                        pan_number: item.employee?.panNumber || '****',
                        notes: item.notes || '',
                        earningsList: filteredEarnings,
                        deductionsList: item.deductions || {}
                    };
                });

                setPayslips(mappedPayslips);

            } catch (error) {
                console.error('Error fetching payslips:', error);
                toast.error('Failed to load payslip data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [runId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 print:p-0 print:bg-white">
            {/* CSS for Print */}
            <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background: white; -webkit-print-color-adjust: exact; }
          nav, header, footer, aside, .no-print { display: none !important; }
          .payslip-container { page-break-after: always; }
          .payslip-container:last-child { page-break-after: auto; }
          /* Reset margins */
           .main-content, .p-4, .sm\\:p-6, .md\\:ml-\\[250px\\], .md\\:ml-\\[70px\\] {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

            {/* Action Header */}
            <div className="max-w-[800px] mx-auto mb-6 flex justify-between items-center no-print">
                <button
                    onClick={() => {
                        if (window.history.length > 2) {
                            router.back();
                        } else {
                            window.close();
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Processing
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Printer className="h-4 w-4" /> Print All
                </button>
            </div>

            {/* Render All Payslips */}
            {payslips.map((payroll) => (
                <div key={payroll.id} className="payslip-container mb-8 print:mb-0 print:w-full print:h-screen">
                    <PayslipTemplate payroll={payroll} shop={shop} />
                </div>
            ))}

            {payslips.length === 0 && (
                <div className="text-center text-gray-500 py-20">No payslips found for this run.</div>
            )}
        </div>
    );
}

// User Provided Template Component
function PayslipTemplate({ payroll, shop }) {
    // Helper for status color
    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        if (s === 'paid') return 'text-green-600 font-bold';
        if (s === 'pending') return 'text-orange-500 font-bold';
        return 'text-gray-600 font-bold';
    };

    return (
        <div className="payroll-slip bg-white mx-auto max-w-[800px] border border-gray-300 p-6 shadow-sm text-gray-800 font-sans print:border-none print:shadow-none print:w-full print:max-w-none">

            {/* Title Section */}
            <div className="text-center py-3 border-t-2 border-b-2 border-gray-800 mb-5">
                <h2 className="text-2xl font-bold text-gray-800 m-0">PAYROLL SLIP</h2>
                <h3 className="text-lg text-gray-600 m-0 mt-1">
                    {payroll.month}
                </h3>
            </div>

            {/* Header Section (Shop Info) */}
            {shop && (
                <div className="mb-5">
                    <div className="flex justify-between items-start">
                        <div className="text-left">
                            <h1 className="text-2xl font-bold m-0">{shop.name}</h1>
                            <p className="text-sm m-0 mt-1 whitespace-pre-line">{shop.address}</p>
                            <p className="text-sm m-0 mt-1">
                                Phone: {shop.phone} | Email: {shop.email}
                            </p>
                        </div>
                    </div>
                    {shop.gst && (
                        <div className="text-left mt-1">
                            <p className="text-sm m-0">GSTIN: {shop.gst}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Employee Details Table */}
            <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                    <tr>
                        <th colSpan="4" className="border border-gray-300 p-2 bg-gray-100 text-center font-bold text-gray-800">Employee Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-300 p-2 font-bold w-[25%]">Employee ID</td>
                        <td className="border border-gray-300 p-2 w-[25%]">{payroll.emp_id}</td>
                        <td className="border border-gray-300 p-2 font-bold w-[25%]">Payroll ID</td>
                        <td className="border border-gray-300 p-2 w-[25%]">{payroll.payroll_id}</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2 font-bold">Employee Name</td>
                        <td className="border border-gray-300 p-2">{payroll.full_name}</td>
                        <td className="border border-gray-300 p-2 font-bold">Designation</td>
                        <td className="border border-gray-300 p-2 capitalize">{payroll.role}</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2 font-bold">Month</td>
                        <td className="border border-gray-300 p-2">{payroll.month}</td>
                        <td className="border border-gray-300 p-2 font-bold">Payment Date</td>
                        <td className="border border-gray-300 p-2">
                            {payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString('en-GB') : 'Not Paid'}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Attendance Details Table */}
            <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                    <tr>
                        <th colSpan="4" className="border border-gray-300 p-2 bg-gray-100 text-center font-bold text-gray-800">Attendance Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-300 p-2 font-bold w-[25%]">Working Days</td>
                        <td className="border border-gray-300 p-2 w-[25%]">{payroll.working_days}</td>
                        <td className="border border-gray-300 p-2 font-bold w-[25%]">Present Days</td>
                        <td className="border border-gray-300 p-2 w-[25%]">{payroll.present_days}</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2 font-bold">Absent Days</td>
                        <td className="border border-gray-300 p-2">{payroll.absent_days ?? (payroll.working_days - payroll.present_days)}</td>
                        <td className="border border-gray-300 p-2 font-bold">Status</td>
                        <td className={`border border-gray-300 p-2 capitalize ${getStatusColor(payroll.status)}`}>
                            {payroll.status}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Salary Breakdown Table */}
            <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                    <tr>
                        <th colSpan="2" className="border border-gray-300 p-2 bg-gray-100 text-center font-bold text-gray-800">Salary Breakdown</th>
                        <th className="border border-gray-300 p-2 bg-gray-100 text-center font-bold text-gray-800">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="2" className="border border-gray-300 p-2 font-bold">Basic Salary</td>
                        <td className="border border-gray-300 p-2 text-right">₹{payroll.basic_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {payroll.earningsList && Object.entries(payroll.earningsList).map(([key, value]) => {
                        const amount = Number(value) || 0;
                        if (amount <= 0) return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return (
                            <tr key={key}>
                                <td colSpan="2" className="border border-gray-300 p-2 font-bold">{label}</td>
                                <td className="border border-gray-300 p-2 text-right">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        );
                    })}
                    {/* Fallback for total allowances if earningsList is empty but total > 0 */}
                    {(!payroll.earningsList || Object.keys(payroll.earningsList).length === 0) && payroll.allowances > 0 && (
                        <tr>
                            <td colSpan="2" className="border border-gray-300 p-2 font-bold">Allowances</td>
                            <td className="border border-gray-300 p-2 text-right">₹{payroll.allowances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    )}

                    {payroll.deductionsList && Object.entries(payroll.deductionsList).map(([key, value]) => {
                        const amount = Number(value) || 0;
                        if (amount <= 0) return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return (
                            <tr key={key}>
                                <td colSpan="2" className="border border-gray-300 p-2 font-bold">{label}</td>
                                <td className="border border-gray-300 p-2 text-right">- ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        );
                    })}
                    {/* Fallback for total deductions if list is empty but total > 0 */}
                    {(!payroll.deductionsList || Object.keys(payroll.deductionsList).length === 0) && payroll.deductions > 0 && (
                        <tr>
                            <td colSpan="2" className="border border-gray-300 p-2 font-bold">Deductions</td>
                            <td className="border border-gray-300 p-2 text-right">- ₹{payroll.deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    )}
                    <tr className="bg-gray-50">
                        <td colSpan="2" className="border border-gray-300 p-2 font-bold text-gray-900">NET SALARY</td>
                        <td className="border border-gray-300 p-2 text-right font-bold text-gray-900">₹{payroll.net_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>

            {/* Payment Details */}
            <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2 bg-gray-100 text-center font-bold text-gray-800">Payment Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-300 p-2">
                            <p className="m-0 mb-1"><strong>Payment Mode:</strong> {payroll.payment_method ? payroll.payment_method.charAt(0).toUpperCase() + payroll.payment_method.slice(1) : 'Not Specified'}</p>
                            <p className="m-0 mb-1"><strong>Bank Account:</strong> {payroll.bank_account || 'Not Specified'}</p>
                            <p className="m-0"><strong>PAN Number:</strong> {payroll.pan_number || 'Not Specified'}</p>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Notes Section */}
            {payroll.notes && (
                <table className="w-full border-collapse mb-4 text-sm">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2 bg-gray-100 text-center font-bold text-gray-800">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 p-2 whitespace-pre-line">{payroll.notes}</td>
                        </tr>
                    </tbody>
                </table>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
                <p className="m-0 mb-1">This is a computer generated payslip and does not require signature</p>
                <p className="m-0">Generated on: {new Date().toLocaleString('en-GB')}</p>
            </div>
        </div>
    );
}
