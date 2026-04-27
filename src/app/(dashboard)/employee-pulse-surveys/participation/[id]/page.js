'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, ArrowLeft, ArrowRight, CheckCircle2,
    AlertTriangle, Loader2, Sparkles, Send,
    ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { pulseSurveyService } from '@/services/hr-services/pulseSurveyService';

export default function SurveyParticipationPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        fetchSurvey();
    }, [id]);

    const fetchSurvey = async () => {
        try {
            const data = await pulseSurveyService.getSurveyById(id);
            setSurvey(data);
        } catch (error) {
            toast.error('Failed to load survey');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleNext = () => {
        const currentQuestion = survey.questions[currentQuestionIndex];
        const answer = answers[currentQuestion.id];

        const isEmpty = !answer || (Array.isArray(answer) && answer.length === 0);

        if (currentQuestion.isRequired && isEmpty) {
            toast.error('This field is mandatory');
            return;
        }
        if (currentQuestionIndex < survey.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            submitSurvey();
        }
    };

    const submitSurvey = async () => {
        try {
            setSubmitting(true);
            const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
                questionId: qId,
                answer: val
            }));
            await pulseSurveyService.submitResponse(id, formattedAnswers);
            setIsCompleted(true);
            toast.success('Your feedback has been recorded.');
        } catch (error) {
            toast.error(error.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-gray-950">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Syncing Environment...</p>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fa] dark:bg-gray-950">
                <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Access Restricted</h1>
                <p className="text-xs text-gray-500 mt-2 font-medium">This engagement node is no longer active or available.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-8 px-8 py-2.5 bg-primary-600 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest shadow-sm"
                >
                    Return
                </button>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fa] dark:bg-gray-950">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white dark:bg-gray-900 p-12 rounded-sm border border-gray-200 dark:border-gray-800 text-center space-y-6 shadow-sm"
                >
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-sm flex items-center justify-center mx-auto mb-2 text-emerald-600 border border-emerald-100">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Transaction Confirmed</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        Your insights have been successfully integrated into the collective intelligence stream. Thank you for your contribution.
                    </p>
                    <button
                        onClick={() => router.push('/employee-pulse-surveys')}
                        className="w-full py-3.5 bg-primary-600 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest shadow-sm hover:bg-primary-700 transition-all"
                    >
                        Back to Terminal
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = survey.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-white dark:bg-gray-900 text-primary-600 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{survey.title}</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{survey.type} • {survey.lifecycle}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Phase Alignment</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-primary-600"
                        />
                    </div>
                </div>

                {/* Question Area */}
                <div className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
                    <div className="p-8 md:p-12 flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-10"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] bg-primary-50 px-3 py-1 rounded-sm">
                                            Step {currentQuestionIndex + 1} of {survey.questions.length}
                                        </span>
                                        {currentQuestion.isRequired && (
                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                                <AlertTriangle size={12} /> Mandatory
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                                        {currentQuestion.questionText}
                                    </h2>
                                </div>

                                {/* Answers Input */}
                                <div className="space-y-4">
                                    {(currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'CHECKBOXES') && (
                                        <div className="grid grid-cols-1 gap-3">
                                            {currentQuestion.options.map((option) => {
                                                const isSelected = currentQuestion.type === 'MULTIPLE_CHOICE'
                                                    ? answers[currentQuestion.id] === option
                                                    : (answers[currentQuestion.id] || []).includes(option);

                                                const handleClick = () => {
                                                    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
                                                        handleAnswer(currentQuestion.id, option);
                                                    } else {
                                                        const currentAnswers = answers[currentQuestion.id] || [];
                                                        const newAnswers = isSelected
                                                            ? currentAnswers.filter(a => a !== option)
                                                            : [...currentAnswers, option];
                                                        handleAnswer(currentQuestion.id, newAnswers);
                                                    }
                                                };

                                                return (
                                                    <button
                                                        key={option}
                                                        onClick={handleClick}
                                                        className={`p-5 text-left rounded-sm border transition-all font-bold text-sm tracking-tight flex items-center gap-4 ${isSelected
                                                            ? 'border-primary-500 bg-primary-50/20 text-primary-700'
                                                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 text-gray-600 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        <div className={`w-4 h-4 border border-gray-300 transition-colors flex items-center justify-center ${currentQuestion.type === 'CHECKBOXES' ? 'rounded-sm' : 'rounded-full'} ${isSelected ? 'border-primary-500 bg-primary-500' : ''}`}>
                                                            {isSelected && <div className={`w-1.5 h-1.5 bg-white ${currentQuestion.type === 'CHECKBOXES' ? '' : 'rounded-full'}`} />}
                                                        </div>
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {currentQuestion.type === 'LIKERT_SCALE' && (
                                        <div className="space-y-6 pt-6">
                                            <div className="flex justify-between items-center max-w-lg mx-auto">
                                                {[1, 2, 3, 4, 5].map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAnswer(currentQuestion.id, val)}
                                                        className={`w-14 h-14 rounded-sm border flex items-center justify-center font-bold text-lg transition-all ${answers[currentQuestion.id] === val
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg'
                                                            : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-200 dark:border-gray-800 hover:border-primary-200'
                                                            }`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-lg mx-auto">
                                                <span>Strongly Disagree</span>
                                                <span>Strongly Agree</span>
                                            </div>
                                        </div>
                                    )}

                                    {currentQuestion.type === 'NPS' && (
                                        <div className="space-y-4 pt-6">
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAnswer(currentQuestion.id, val)}
                                                        className={`w-10 h-10 rounded-sm border flex items-center justify-center text-xs font-bold transition-all ${answers[currentQuestion.id] === val
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                                                            }`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
                                                <span>Not Likely</span>
                                                <span>Extremely Likely</span>
                                            </div>
                                        </div>
                                    )}

                                    {currentQuestion.type === 'OPEN_TEXT' && (
                                        <textarea
                                            rows="6"
                                            placeholder="Specify detailed input..."
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                            className="w-full p-6 bg-gray-50 dark:bg-gray-800 border-none rounded-sm outline-none transition-all text-gray-900 dark:text-white font-medium resize-none shadow-inner text-sm leading-relaxed"
                                        />
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-8 md:px-12 bg-gray-50/50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            disabled={currentQuestionIndex === 0}
                            className={`flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all ${currentQuestionIndex === 0 ? 'opacity-0 cursor-default pointer-events-none' : 'text-gray-400 hover:text-primary-600'
                                }`}
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={submitting}
                            className="flex items-center gap-2 px-10 py-3 bg-primary-600 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest shadow-sm hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                currentQuestionIndex === survey.questions.length - 1 ? (
                                    <>Authorize Submission <Send size={14} /></>
                                ) : (
                                    <>Next Phase <ArrowRight size={14} /></>
                                )
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                        <Sparkles size={14} className="text-primary-400 opacity-50" /> Secure Encryption Active
                    </div>
                </div>
            </div>
        </div>
    );
}
