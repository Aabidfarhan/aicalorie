import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const TIPS = [
    "Aim for 20-30g of protein at breakfast to curb cravings later.",
    "Drink water 30 minutes before a meal to help digestion.",
    "Include fiber-rich foods like oats or berries for sustained energy.",
    "Walking for just 10 mins after meals can lower blood sugar.",
    "Healthy fats like avocado keep you full longer than carbs.",
    "Try not to eat 3 hours before bed for better sleep quality."
];

const AICoachCard = () => {
    const [tip, setTip] = useState(TIPS[0]);
    const [loading, setLoading] = useState(false);

    const refreshTip = () => {
        setLoading(true);
        setTimeout(() => {
            const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
            setTip(randomTip);
            setLoading(false);
        }, 600);
    };

    return (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Sparkles size={20} className="text-emerald-100" />
                </div>
                <button
                    onClick={refreshTip}
                    className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-end">
                <h3 className="text-lg font-bold mb-2">AI Health Insight</h3>
                <p className="text-emerald-50 text-sm leading-relaxed min-h-[60px] opacity-90">
                    "{tip}"
                </p>
                <div className="mt-4 pt-4 border-t border-white/20 flex gap-2">
                    <span className="px-2 py-1 bg-white/10 rounded text-xs font-medium text-emerald-50">#Nutrition</span>
                    <span className="px-2 py-1 bg-white/10 rounded text-xs font-medium text-emerald-50">#Wellness</span>
                </div>
            </div>
        </div>
    );
};

export default AICoachCard;
