import React from 'react';
import { Droplet, Plus, Minus } from 'lucide-react';

const WaterTracker = ({ water, setWater, goal = 8 }) => {
    const progressPercentage = Math.min(100, (water / goal) * 100);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 soft-shadow transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl">
                        <Droplet size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Water Consumption</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Daily Goal: {goal * 250}ml ({goal} glasses)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl">
                    <button 
                        onClick={() => setWater(Math.max(0, water - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:text-blue-500 transition-colors"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="text-sm font-bold w-12 text-center text-slate-700 dark:text-slate-200">{water * 250}ml</span>
                    <button 
                        onClick={() => setWater(water + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div className="relative h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                <span>0ml</span>
                <span className="text-blue-500">{water} / {goal} glasses</span>
                <span>{goal * 250}ml</span>
            </div>
        </div>
    );
};

export default WaterTracker;
