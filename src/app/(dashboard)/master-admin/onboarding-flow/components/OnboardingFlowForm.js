'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Shield, Zap, Briefcase, Star, CreditCard, ArrowRight, LayoutDashboard, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';
import { useRouter } from 'next/navigation';

const onboardingSteps = [
	{
		key: 'company',
		label: 'Company Profile',
		requiredFields: ['companyName', 'companyEmail', 'expectedGoLiveDate', 'industry', 'companyId'],
	},
	{ key: 'owner', label: 'Owner Details', requiredFields: ['ownerName', 'ownerEmail', 'ownerPhone'] },
	{ key: 'gst', label: 'GST Details', requiredFields: ['gstType', 'gstNumber'] },
	{ key: 'plan', label: 'Subscription Plan', requiredFields: ['subscriptionPlan'] },
];

const getEmptyValues = () => ({
	companyId: '',
	companyName: '',
	companyEmail: '',
	companyPhone: '',
	website: '',
	industry: '',
	address: '',
	city: '',
	state: '',
	country: 'India',
	ownerName: '',
	ownerEmail: '',
	ownerPhone: '',
	ownerDesignation: '',
	gstNumber: '',
	gstType: 'Regular',
	gstState: '',
	panNumber: '',
	expectedGoLiveDate: '',
	employeeCount: '',
	onboardingNotes: '',
	subscriptionPlan: '',
	startDate: new Date().toISOString().slice(0, 10),
});

const isValueFilled = (value) => {
	if (value === null || value === undefined) return false;
	return String(value).trim().length > 0;
};

const isStepComplete = (stepIndex, values) => {
	const step = onboardingSteps[stepIndex];
	if (!step) return false;
	if (!step.requiredFields?.length) return true;

	return step.requiredFields.every((field) => {
		if (field === 'gstNumber' && values.gstType === 'No GST') return true;
		return isValueFilled(values[field]);
	});
};

export default function OnboardingFlowForm({
	mode = 'create',
	initialValues = {},
	onSubmit,
	onCancel,
}) {
	const router = useRouter();
	const mergedInitialValues = useMemo(
		() => ({ ...getEmptyValues(), ...initialValues }),
		[initialValues]
	);

	const [values, setValues] = useState(mergedInitialValues);
	const [step, setStep] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [companies, setCompanies] = useState([]);
	const [dbPlans, setDbPlans] = useState([]);
	const [isCompleted, setIsCompleted] = useState(false);
	const [completionData, setCompletionData] = useState(null);

	const isViewMode = mode === 'view';

	const billingStartDate = useMemo(() => {
		const start = values.startDate ? new Date(values.startDate) : new Date();
		const trialDays = parseInt(values.trialPeriodDays || '0');
		if (isNaN(trialDays) || trialDays <= 0) return start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

		const billingDate = new Date(start);
		billingDate.setDate(billingDate.getDate() + trialDays);
		return billingDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
	}, [values.startDate, values.trialPeriodDays]);

	// Fetch companies
	useEffect(() => {
		if (mode === 'create') {
			apiClient
				.get('/master-admin/company')
				.then((res) => setCompanies(res.data.companies || []))
				.catch(() => toast.error('Failed to fetch companies list'));
		}

		// Fetch subscription plans
		apiClient
			.get('/master-admin/subscriptions')
			.then((res) => {
				setDbPlans(res.data.data || []);
			})
			.catch(() => toast.error('Failed to fetch subscription plans'));
	}, [mode]);

	const updateValue = (field, value) => {
		setValues((prev) => {
			const next = { ...prev, [field]: value };

			// GST Logic
			if (field === 'gstNumber') {
				next.gstNumber = typeof value === 'string' ? value.replace(/\D/g, '') : value;
			}
			if (field === 'gstType' && value === 'No GST') {
				next.gstNumber = '';
				next.gstState = '';
			}
			return next;
		});
	};

	const handleNext = () => {
		if (isViewMode) {
			setStep((prev) => Math.min(prev + 1, onboardingSteps.length - 1));
			return;
		}
		if (!isStepComplete(step, values)) {
			toast.error('Please complete all required fields');
			return;
		}
		setStep((prev) => Math.min(prev + 1, onboardingSteps.length - 1));
	};

	const handlePrev = () => {
		setStep((prev) => Math.max(prev - 1, 0));
	};

	const handleStepClick = (index) => {
		if (isViewMode || index <= step) setStep(index);
	};

	// Final Submission Logic
	const handleFinishSetup = async () => {
		// Validate all steps before finalizing
		for (let i = 0; i < onboardingSteps.length; i++) {
			if (!isStepComplete(i, values)) {
				setStep(i);
				toast.error(`Please complete all required fields in Step ${i + 1}: ${onboardingSteps[i].label}`);
				return;
			}
		}

		setIsSaving(true);
		try {
			const payload = {
				...values,
				companyId: parseInt(values.companyId),
				employeeCount: values.employeeCount ? parseInt(values.employeeCount) : 0,
				expectedGoLiveDate: values.expectedGoLiveDate ? new Date(values.expectedGoLiveDate).toISOString() : null,
				startDate: values.startDate ? new Date(values.startDate).toISOString() : new Date().toISOString(),
			};

			let result = null;
			if (onSubmit) {
				result = await onSubmit(payload);
			}

			if (result) {
				setCompletionData({
					companyName: values.companyName,
				});
				setIsCompleted(true);
			}
		} catch (error) {
			console.error('Submission Error:', error);
			toast.error('Failed to finalize onboarding');
		} finally {
			setIsSaving(false);
		}
	};

	// --- VIEWS ---

	// Success / Completion View
	if (isCompleted && completionData) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[500px] max-w-2xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-300">
				<div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
					<CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
				</div>

				<div className="space-y-2">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white">
						Company Created Successfully!
					</h2>
					<p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
						{completionData.companyName} has been set up. The Company Admin can now log in to configure their subscription and payment.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 w-full">
					<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
						<p className="text-xs text-gray-500 uppercase font-semibold">Company</p>
						<p className="font-bold text-gray-900 dark:text-white mt-1 truncate">{completionData.companyName}</p>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 pt-4">
					<button
						onClick={() => router.push('/master-admin/dashboard')}
						className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
					>
						<LayoutDashboard size={18} /> Go to Dashboard
					</button>
					<button
						onClick={() => router.push('/master-admin/onboarding-flow')}
						className="px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition flex items-center gap-2 shadow-lg shadow-primary-500/30"
					>
						<Building2 size={18} /> View Onboarding List
					</button>
				</div>
			</div>
		);
	}

	// Main Form View
	return (
		<div className="space-y-6">
			{/* Stepper */}
			<div className="mb-10">
				<div className="flex items-center justify-between w-full relative">
					{/* Connecting Line - Background */}
					<div className="absolute left-0 top-5 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full" />

					{/* Connecting Line - Progress */}
					<div
						className="absolute left-0 top-5 h-1 bg-primary-600 transition-all duration-500 ease-in-out -z-10 rounded-full"
						style={{ width: `${(step / (onboardingSteps.length - 1)) * 100}%` }}
					/>

					{onboardingSteps.map((stepItem, index) => {
						const isActive = index === step;
						const isComplete = index < step;

						return (
							<div key={stepItem.key} className="flex flex-col items-center group cursor-pointer" onClick={() => handleStepClick(index)}>
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${isComplete ? 'bg-primary-600 border-primary-600 text-white scale-100' :
										isActive ? 'bg-white dark:bg-gray-900 border-primary-600 text-primary-600 scale-110 shadow-lg ring-2 ring-primary-100' :
											'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-300'
										}`}
								>
									{isComplete ? <CheckCircle2 size={20} strokeWidth={3} /> : <span className="text-sm font-bold">{index + 1}</span>}
								</div>
								<span className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors duration-300 w-32 text-center ${isActive ? 'text-primary-700 dark:text-primary-400' :
									isComplete ? 'text-primary-600/70' :
										'text-gray-400'
									}`}>
									{stepItem.label}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			<form onSubmit={(e) => e.preventDefault()}>
				{/* Step 0: Company Profile */}
				{step === 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
						{mode === 'create' && (
							<div className="md:col-span-2 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/50">
								<label className="block text-sm font-bold text-primary-900 dark:text-primary-100 mb-2">Select Company to Onboard *</label>
								<select
									value={values.companyId || ''}
									onChange={(e) => {
										const selectedId = e.target.value;
										const selectedCompany = companies.find(c => String(c.id) === String(selectedId));
										console.log('selectedCompany', selectedCompany);
										setValues(prev => ({
											...prev,
											companyId: selectedId,
											companyName: selectedCompany?.name || '',
											companyEmail: selectedCompany?.contactEmail || '',
											companyPhone: selectedCompany?.phone || '',
											industry: selectedCompany?.industryType || '',
											ownerName: selectedCompany?.ownerName || '',
											ownerEmail: selectedCompany?.ownerEmail || '',
											ownerPhone: selectedCompany?.ownerPhone || '',
											gstType: selectedCompany?.gstType || 'Regular',
											gstNumber: selectedCompany?.gstNumber || '',
											expectedGoLiveDate: selectedCompany?.expectedGoLiveDate ? new Date(selectedCompany.expectedGoLiveDate) : null,
										}));
									}}
									className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
								>
									<option value="">-- Choose a Company --</option>
									{companies.map((c) => (
										<option key={c.id} value={c.id}>{c.name}</option>
									))}
								</select>
							</div>
						)}
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name *</label>
							<input type="text" value={values.companyName || ''} onChange={(e) => updateValue('companyName', e.target.value)} disabled={isViewMode} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Acme Corp" />
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Email *</label>
							<input type="email" value={values.companyEmail || ''} onChange={(e) => updateValue('companyEmail', e.target.value)} disabled={isViewMode || !!values.companyId} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="admin@acme.com" />
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Go-Live *</label>
							<DatePicker name="expectedGoLiveDate" value={values.expectedGoLiveDate || ''} onChange={(e) => updateValue('expectedGoLiveDate', e.target.value)} disabled={isViewMode} placeholder="Select Date" dateFormat="d-m-Y" />
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry *</label>
							<input type="text" value={values.industry || ''} onChange={(e) => updateValue('industry', e.target.value)} disabled={isViewMode} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Technology" />
						</div>
					</div>
				)}

				{/* Step 1: Owner Details */}
				{step === 1 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner Name *</label>
							<input type="text" value={values.ownerName || ''} onChange={(e) => updateValue('ownerName', e.target.value)} disabled={isViewMode} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner Email *</label>
							<input type="email" value={values.ownerEmail || ''} onChange={(e) => updateValue('ownerEmail', e.target.value)} disabled={isViewMode} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone *</label>
							<input type="tel" value={values.ownerPhone || ''} onChange={(e) => updateValue('ownerPhone', e.target.value)} disabled={isViewMode} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
						</div>
					</div>
				)}

				{/* Step 2: GST Details */}
				{step === 2 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">GST Type *</label>
							<select value={values.gstType || 'Regular'} onChange={(e) => updateValue('gstType', e.target.value)} disabled={isViewMode} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
								<option value="Regular">Regular</option>
								<option value="Composition">Composition</option>
								<option value="No GST">No GST</option>
							</select>
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">GST Number {values.gstType !== 'No GST' && '*'}</label>
							<input type="text" value={values.gstNumber || ''} onChange={(e) => updateValue('gstNumber', e.target.value)} disabled={isViewMode || values.gstType === 'No GST'} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
						</div>
					</div>
				)}

				{/* Step 3: Subscription (Redesign) */}
				{step === 3 && (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-right-4 duration-300 pt-6">
						{/* Left: Configuration */}
						<div className="lg:col-span-7 space-y-10">
							{/* Plans */}
							<div>
								<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Choose a Plan *</h3>
								<div className="space-y-4">
									{(Array.isArray(dbPlans) && dbPlans.length > 0 ? dbPlans : [
										{ id: 'Starter', name: 'Starter', price: 2999, description: 'For small teams' },
										{ id: 'Professional', name: 'Professional', price: 5999, description: 'For growing business' },
										{ id: 'Enterprise', name: 'Enterprise', price: 0, description: 'For large organizations' }
									]).map((plan, idx) => {
										const planId = String(plan.id || plan.name);
										const isSelected = String(values.subscriptionPlan) === planId;
										const isStatic = !plan.createdAt;

										const icons = [Zap, Star, Briefcase];
										const colors = ['text-blue-500', 'text-purple-500', 'text-orange-500'];
										const bgs = ['bg-blue-50', 'bg-purple-50', 'bg-orange-50'];
										
										const Icon = icons[idx % icons.length] || Zap;
										const color = colors[idx % colors.length] || 'text-blue-500';
										const bg = bgs[idx % bgs.length] || 'bg-blue-50';

										return (
											<button
												key={planId}
												type="button"
												disabled={isViewMode}
												onClick={() => updateValue('subscriptionPlan', planId)}
												className={`w-full text-left relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 select-none group focus:outline-none overflow-hidden ${isSelected
													? 'border-primary-600 bg-primary-50/20 dark:bg-primary-900/10 shadow-md z-10'
													: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
													} ${isViewMode ? 'cursor-default' : 'cursor-pointer hover:border-primary-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'}`}
											>
												<div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${bg} ${color} dark:bg-gray-700`}>
													<Icon size={24} />
												</div>
												<div className="ml-4 flex-1">
													<div className="flex justify-between items-center">
														<span className="font-bold text-gray-900 dark:text-white text-lg">{plan.name}</span>
														<span className="font-bold text-gray-900 dark:text-white text-lg">
															{plan.price > 0 ? `₹${plan.price.toLocaleString()}` : 'Custom'}
														</span>
													</div>
													<div className="flex justify-between items-center mt-1">
														<span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{plan.description}</span>
														{(idx === 1 && isStatic) && (
															<span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
																MOST POPULAR
															</span>
														)}
													</div>
												</div>
												<div className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400'
													}`}>
													{isSelected && <CheckCircle2 size={14} strokeWidth={3} />}
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</div>

						{/* Right: Summary */}
						<div className="lg:col-span-5">
							<div className="sticky top-6">
								<div className="bg-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
									<div className="p-8 pb-6 border-b border-gray-800">
										<p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Order Summary</p>
										<div className="flex justify-between items-baseline">
											<h2 className="text-3xl font-bold">
												{(() => {
													const plans = Array.isArray(dbPlans) ? dbPlans : [];
													const selected = plans.find(p => String(p.id || p.name) === String(values.subscriptionPlan));
													if (selected) {
														return selected.price > 0 ? `₹${selected.price.toLocaleString()}` : 'Custom';
													}
													return values.subscriptionPlan === 'Starter' ? '₹2,999' : values.subscriptionPlan === 'Professional' ? '₹5,999' : 'Custom';
												})()}
											</h2>
											<span className="text-gray-400 font-medium">/ month</span>
										</div>
									</div>
									<div className="p-8 space-y-6">
										<div className="flex items-center gap-4">
											<div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
												<Building2 size={24} />
											</div>
											<div>
												<p className="text-gray-400 text-xs uppercase font-bold">Company</p>
												<p className="font-bold text-lg leading-tight truncate w-48">{values.companyName || 'Not Selected'}</p>
											</div>
										</div>
										<div className="space-y-4 pt-4 border-t border-gray-800">
											<div className="flex justify-between text-sm">
												<span className="text-gray-400">Trial Period</span>
												<span className="font-bold">
													{(() => {
														const plans = Array.isArray(dbPlans) ? dbPlans : [];
														const selected = plans.find(p => (p.id || p.name) === values.subscriptionPlan);
														const days = selected?.trialDays || 0;
														return days > 0 ? `${days} Days` : 'None';
													})()}
												</span>
											</div>
										</div>
										<div className="bg-white/10 rounded-xl p-4 mt-6">
											<div className="flex justify-between items-center">
												<span className="text-green-400 font-bold">Due Today</span>
												<span className="text-xl font-bold text-green-400">₹0.00</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}


				{/* --- FOOTER ACTIONS --- */}
				<div className="flex flex-wrap items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
						>
							Cancel
						</button>
					)}

					<div className="flex gap-3 ml-auto">
						<button
							type="button"
							onClick={handlePrev}
							disabled={step === 0}
							className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
						>
							Back
						</button>

						{step < onboardingSteps.length - 1 ? (
							<button
								type="button"
								onClick={handleNext}
								className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-transform active:scale-95"
							>
								Next Step
							</button>
						) : (
							<button
								type="button"
								onClick={handleFinishSetup}
								disabled={isSaving || isProcessingPayment || isViewMode || !isValueFilled(values.subscriptionPlan) || (Array.isArray(dbPlans) && dbPlans.length > 0 && !dbPlans.some(p => String(p.id || p.name) === String(values.subscriptionPlan)))}
								className="px-8 py-2.5 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-lg shadow-green-500/20 transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSaving || isProcessingPayment ? (
									<><Loader2 size={16} className="animate-spin" /> Processing...</>
								) : (
									<>Finish Setup <ArrowRight size={16} /></>
								)}
							</button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
}