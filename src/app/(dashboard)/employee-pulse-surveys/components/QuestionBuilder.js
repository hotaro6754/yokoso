'use client';

import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, GripVertical, Type,
    CheckSquare, Hash, AlignLeft, BarChart2,
    ChevronDown, Settings2, AlertCircle, MousePointer2
} from 'lucide-react';

const QUESTION_TYPES = [
    { id: 'MULTIPLE_CHOICE', label: 'Choices', icon: MousePointer2 },
    { id: 'CHECKBOXES', label: 'Checkboxes', icon: CheckSquare },
    { id: 'LIKERT_SCALE', label: 'Likert', icon: BarChart2 },
    { id: 'NPS', label: 'NPS', icon: Hash },
    { id: 'OPEN_TEXT', label: 'Text Input', icon: AlignLeft },
];

export default function QuestionBuilder({ questions, setQuestions }) {
    const [activeQuestion, setActiveQuestion] = useState(null);

    const addQuestion = (type) => {
        const newQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            type,
            options: ['Option 1', 'Option 2'],
            isRequired: true,
            order: questions.length + 1
        };
        setQuestions([...questions, newQuestion]);
        setActiveQuestion(newQuestion.id);
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id, updates) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const addOption = (questionId) => {
        const q = questions.find(q => q.id === questionId);
        updateQuestion(questionId, { options: [...q.options, `Option ${q.options.length + 1}`] });
    };

    const removeOption = (questionId, index) => {
        const q = questions.find(q => q.id === questionId);
        updateQuestion(questionId, { options: q.options.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-8">
            {/* Question Type Selector */}
            <div className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => addQuestion(type.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm hover:border-primary-500 hover:text-primary-600 transition-all group"
                    >
                        <type.icon size={14} className="text-gray-400 group-hover:text-primary-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-primary-600">
                            + {type.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Questions List */}
            <Reorder.Group
                axis="y"
                values={questions}
                onReorder={setQuestions}
                className="space-y-4"
            >
                <AnimatePresence mode="popLayout">
                    {questions.map((q, index) => (
                        <Reorder.Item
                            key={q.id}
                            value={q}
                            className={`bg-white dark:bg-gray-900 rounded-sm border transition-all ${activeQuestion === q.id
                                ? 'border-primary-400 shadow-sm'
                                : 'border-gray-200 dark:border-gray-800'
                                }`}
                            onClick={() => setActiveQuestion(q.id)}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500">
                                        <GripVertical size={16} />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-sm">
                                                    {QUESTION_TYPES.find(t => t.id === q.type)?.label}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-300 hover:text-rose-500 rounded-sm transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <textarea
                                            placeholder="Specify the inquiry statement..."
                                            value={q.text}
                                            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                            className="w-full bg-transparent border-none text-base font-bold text-gray-900 dark:text-white placeholder-gray-200 focus:ring-0 resize-none p-0 leading-tight"
                                            rows="1"
                                        />

                                        {/* Options rendering */}
                                        {(q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOXES') && (
                                            <div className="space-y-2 pt-2">
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-3 group">
                                                        <div className={`w-4 h-4 border border-gray-300 dark:border-gray-700 ${q.type === 'CHECKBOXES' ? 'rounded-sm' : 'rounded-full'}`} />
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...q.options];
                                                                newOpts[optIndex] = e.target.value;
                                                                updateQuestion(q.id, { options: newOpts });
                                                            }}
                                                            className="flex-1 bg-transparent border-none p-1 text-sm font-medium text-gray-600 dark:text-gray-400 focus:bg-gray-50 dark:focus:bg-gray-800 rounded-sm"
                                                        />
                                                        <button
                                                            onClick={() => removeOption(q.id, optIndex)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-rose-500 transition-all"
                                                        >
                                                            <Plus className="w-4 h-4 rotate-45" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addOption(q.id)}
                                                    className="inline-flex items-center gap-2 text-[10px] font-bold text-primary-600 uppercase tracking-widest pt-2 hover:underline"
                                                >
                                                    <Plus size={12} /> Add Response Node
                                                </button>
                                            </div>
                                        )}

                                        {q.type === 'LIKERT_SCALE' && (
                                            <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 p-4 rounded-sm border border-gray-100 dark:border-gray-800">
                                                <span>Strongly Disagree</span>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <div key={n} className="w-8 h-8 rounded-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                            {n}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span>Strongly Agree</span>
                                            </div>
                                        )}

                                        {q.type === 'NPS' && (
                                            <div className="pt-2 space-y-2">
                                                <div className="flex items-center gap-1">
                                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                        <div key={n} className="flex-1 aspect-square border border-gray-200 dark:border-gray-800 rounded-sm flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                            {n}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 tracking-widest px-1">
                                                    <span>Not Likely</span>
                                                    <span>Very Likely</span>
                                                </div>
                                            </div>
                                        )}

                                        {q.type === 'OPEN_TEXT' && (
                                            <div className="pt-2">
                                                <div className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-sm border border-dashed border-gray-200 dark:border-gray-700 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                                                    Participant Text Input Field
                                                </div>
                                            </div>
                                        )}

                                        {/* Question Meta */}
                                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50 dark:border-gray-800/50">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={q.isRequired}
                                                    onChange={(e) => updateQuestion(q.id, { isRequired: e.target.checked })}
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 relative"></div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">Mandatory Field</span>
                                            </label>

                                            <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">
                                                <Settings2 size={12} /> Branching Logic
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            {questions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-sm bg-gray-50/30 dark:bg-gray-900/10">
                    <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center mb-4 transition-transform hover:scale-105">
                        <Plus size={20} className="text-gray-300" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Initialize Question Stack</p>
                    <p className="text-[10px] text-gray-300 font-medium mt-1">Select a response type from the menu above</p>
                </div>
            )}
        </div>
    );
}
