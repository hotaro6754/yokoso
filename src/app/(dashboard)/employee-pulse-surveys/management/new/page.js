'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, Save, Layout, ClipboardList,
    Settings as SettingsIcon, Rocket, CheckCircle2,
    Calendar, Info, HelpCircle, Layers, MousePointer2,
    Type, CheckSquare, Hash, AlignLeft, BarChart,
    Shield, AlertCircle, ChevronLeft, Send, LayoutPanelTop
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import QuestionBuilder from '../../components/QuestionBuilder';
import Breadcrumb from '@/components/common/Breadcrumb';
import DatePicker from '@/components/common/DatePicker';

export default function NewSurveyWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        type: '',
        lifecycle: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        isAnonymous: true,
        allowMultiple: false,
        questions: []
    });

    const steps = [
        { id: 1, title: 'Architecture' },
        { id: 2, title: 'Identity' },
        { id: 3, title: 'Inquiry' },
        { id: 4, title: 'Auth' },
    ];

    const surveyTypes = [
        { id: 'POLL', title: 'Poll-based', desc: 'Single-node voting', icon: MousePointer2 },
        { id: 'QUESTIONNAIRE', title: 'Questionnaire', desc: 'General inquiry form', icon: ClipboardList },
        { id: 'QUIZ', title: 'Assessment', desc: 'Scored validation units', icon: Layout },
        { id: 'ENGAGEMENT', title: 'Engagement', desc: 'Sentiment analysis', icon: BarChart },
    ];

    const lifecycles = [
        { id: 'ONBOARDING', title: 'Onboarding (First 30/60/90 Days)' },
        { id: 'TRAINING_DEVELOPMENT', title: 'Training & Development' },
        { id: 'PERFORMANCE_REVIEW', title: 'Performance Review Feedback' },
        { id: 'PROMOTION_CHANGE', title: 'Promotion or Role Change' },
        { id: 'PULSE_DAILY_WEEKLY', title: 'Daily or Weekly Pulse' },
        { id: 'EXIT_OFFBOARDING', title: 'Exit or Offboarding' },
        { id: 'FEEDBACK_360', title: '360-Degree Feedback' },
        { id: 'WELLNESS', title: 'Wellness Feedback' },
        { id: 'LEARNING_DEVELOPMENT', title: 'Learning and Development' },
        { id: 'RECOGNITION', title: 'Recognition' },
        { id: 'WELL_BEING', title: 'Employee Well-being' }
    ];

    const [isPublishing, setIsPublishing] = useState(false);

    const handleNext = () => {
        if (currentStep === 1 && (!formData.type || !formData.lifecycle)) {
            toast.error('Specify Survey Parameters');
            return;
        }
        if (currentStep === 2 && (!formData.title || !formData.startDate || !formData.endDate)) {
            toast.error('Identity & Validity Required');
            return;
        }
        if (currentStep === 3 && formData.questions.length === 0) {
            toast.error('Initialize Question Stack');
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePublish = async () => {
        try {
            setIsPublishing(true);
            const { pulseSurveyService } = await import('@/services/hr-services/pulseSurveyService');
            await pulseSurveyService.createSurvey(formData);
            toast.success('Broadcast successful');
            router.push('/employee-pulse-surveys');
        } catch (error) {
            toast.error('Transmission failure');
        } finally {
            setIsPublishing(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="relative mb-12">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0" />
            <div className="relative z-10 flex justify-between items-center max-w-2xl mx-auto">
                {steps.map((step, i) => (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2 ${currentStep === step.id
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                            : currentStep > step.id
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-300'
                            }`}>
                            {currentStep > step.id ? <CheckCircle2 size={14} /> : step.id}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${currentStep === step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header & Navigation */}
                <div className="space-y-4">
                    <Breadcrumb
                        items={[
                            { label: "Surveys", href: "/employee-pulse-surveys" },
                            { label: "Initiation" },
                        ]}
                    />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Project Initiation</h1>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Configure Engagement Node</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                            <ArrowLeft size={14} /> Return
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-8 sm:p-12 flex-1">
                        {renderStepIndicator()}

                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Measurement Framework</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {surveyTypes.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setFormData({ ...formData, type: t.id })}
                                                        className={`p-4 rounded-sm border text-center transition-all relative group h-32 flex flex-col items-center justify-center gap-2 ${formData.type === t.id
                                                            ? 'border-primary-500 bg-primary-50/10'
                                                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${formData.type === t.id ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-gray-300 group-hover:text-primary-500'}`}>
                                                            <t.icon size={16} />
                                                        </div>
                                                        <div className="space-y-0.5 text-center">
                                                            <h4 className="font-bold text-gray-900 dark:text-white text-[11px] uppercase tracking-tight">{t.title}</h4>
                                                            <p className="text-[9px] text-gray-400 font-medium leading-none">{t.desc}</p>
                                                        </div>
                                                        {formData.type === t.id && (
                                                            <div className="absolute top-2 right-2 text-primary-500">
                                                                <CheckCircle2 size={12} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Lifecycle Orientation</label>
                                            <select
                                                value={formData.lifecycle}
                                                onChange={(e) => setFormData({ ...formData, lifecycle: e.target.value })}
                                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 transition-all font-bold text-xs text-gray-500 hover:text-gray-900 dark:text-white cursor-pointer uppercase tracking-widest"
                                            >
                                                <option value="">Choose Targeted Lifecycle...</option>
                                                {lifecycles.map((l) => (
                                                    <option key={l.id} value={l.id}>{l.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Assignment</label>
                                            <input
                                                type="text"
                                                placeholder="Identity Designation..."
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 transition-all font-bold text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Context Distribution</label>
                                            <textarea
                                                rows="5"
                                                placeholder="Inquiry mission statement..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm outline-none focus:border-primary-400 transition-all text-xs font-medium text-gray-900 dark:text-white resize-none leading-relaxed"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar size={12} className="text-primary-500" /> Commencement
                                                </label>
                                                <DatePicker
                                                    name="startDate"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                    className="!rounded-sm !bg-gray-50 dark:!bg-gray-800 !border-gray-100 dark:!border-gray-800 !font-bold !text-xs"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar size={12} className="text-gray-400" /> Expiration
                                                </label>
                                                <DatePicker
                                                    name="endDate"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                    className="!rounded-sm !bg-gray-50 dark:!bg-gray-800 !border-gray-100 dark:!border-gray-800 !font-bold !text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <QuestionBuilder
                                        questions={formData.questions}
                                        setQuestions={(newQuestions) => setFormData({ ...formData, questions: newQuestions })}
                                    />
                                </motion.div>
                            )}

                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-12 py-4"
                                >
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-sm flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 text-emerald-600">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">System Authorization</h2>
                                            <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">Final Validation Check</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                        <div className="p-6 bg-gray-50/30 dark:bg-gray-800/20 rounded-sm border border-gray-100 dark:border-gray-800 space-y-6">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none block border-b border-gray-100 dark:border-gray-800 pb-3">Protocol</label>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-[11px] text-gray-900 dark:text-white uppercase">Anonymize</p>
                                                        <p className="text-[9px] text-gray-400 font-medium">Mask Identity Nodes.</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={formData.isAnonymous}
                                                            onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                                        />
                                                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-600 relative"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-[11px] text-gray-900 dark:text-white uppercase">Redundancy</p>
                                                        <p className="text-[9px] text-gray-400 font-medium">Multi-Entry Auth.</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={formData.allowMultiple}
                                                            onChange={(e) => setFormData({ ...formData, allowMultiple: e.target.checked })}
                                                        />
                                                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-600 relative"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gray-50/30 dark:bg-gray-800/20 rounded-sm border border-gray-100 dark:border-gray-800 space-y-5">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none block border-b border-gray-100 dark:border-gray-800 pb-3">Transmission</label>

                                            <div className="space-y-3">
                                                <div className="p-4 bg-white dark:bg-gray-900 rounded-sm border border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center gap-2 text-primary-600 mb-1.5">
                                                        <Rocket size={12} />
                                                        <span className="font-bold text-[9px] uppercase tracking-widest leading-none">Global Sink</span>
                                                    </div>
                                                    <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                                                        Broadcasting to all personnel nodes via high-priority stream.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 sm:px-12 bg-gray-50/50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all ${currentStep === 1 ? 'opacity-0 cursor-default pointer-events-none' : 'text-gray-400 hover:text-primary-600'
                                }`}
                        >
                            <ChevronLeft size={14} />
                            Return
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="px-5 py-2.5 rounded-sm border border-gray-200 dark:border-gray-700 font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all text-gray-400 disabled:opacity-50"
                            >
                                {isPublishing ? '---' : 'Draft'}
                            </button>
                            <button
                                onClick={currentStep < 4 ? handleNext : handlePublish}
                                disabled={isPublishing}
                                className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest shadow-sm hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {currentStep < 4 ? (
                                    <>
                                        Next Phase
                                        <ArrowRight size={14} />
                                    </>
                                ) : (
                                    <>
                                        {isPublishing ? 'Deploying...' : 'Deploy Node'}
                                        <Send size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-primary-50/10 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-800/50 rounded-sm flex gap-3">
                    <Info size={14} className="text-primary-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-primary-800/60 dark:text-primary-400 font-bold uppercase tracking-widest leading-relaxed">
                        Secure encryption active. Insights will synchronize with the <strong className="font-black">Command Center</strong> once participation commences.
                    </p>
                </div>
            </div>
        </div>
    );
}
