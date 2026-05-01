import React from 'react';
import { clsx } from 'clsx';
import { Egg, Wheat, Droplet } from 'lucide-react';

const MacroOverview = ({ protein = 0, carbs = 0, fat = 0 }) => {
    // Basic targets for now - in a real app these could be dynamic based on user Settings
    const TARGETS = {
        protein: 120, // grams
        carbs: 250,   // grams
        fat: 70       // grams
    };

    const macros = [
        {
            label: 'Protein',
            val: protein,
            target: TARGETS.protein,
            color: 'bg-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-400',
            icon: Egg
        },
        {
            label: 'Carbs',
            val: carbs,
            target: TARGETS.carbs,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-600 dark:text-emerald-400',
            icon: Wheat
        },
        {
            label: 'Fat',
            val: fat,
            target: TARGETS.fat,
            color: 'bg-yellow-500',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-600 dark:text-yellow-400',
            icon: Droplet
        },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 soft-shadow">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                Macro Breakdown
                <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Today</span>
            </h3>

            <div className="grid grid-cols-3 gap-8">
                {macros.map((m) => {
                    const pct = Math.min(100, (m.val / m.target) * 100);
                    return (
                        <div key={m.label} className="flex flex-col items-center gap-3">
                            {/* Circular Progress (Simplified CSS) */}
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="32" cy="32" r="28"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        fill="transparent"
                                        className="text-slate-100 dark:text-slate-700"
                                    />
                                    <circle
                                        cx="32" cy="32" r="28"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        fill="transparent"
                                        strokeDasharray={175.9}
                                        strokeDashoffset={175.9 - (175.9 * pct) / 100}
                                        className={clsx(m.text, "transition-all duration-1000 ease-out")}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className={clsx("absolute inset-0 flex items-center justify-center flex-col text-xs font-bold", "text-slate-700 dark:text-slate-200")}>
                                    <span>{Math.round(m.val)}g</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{m.label}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">/ {m.target}g</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MacroOverview;
