import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Leaf, Flame, Dumbbell } from 'lucide-react';
import { INDIAN_FOODS } from '../data/indianFoods';

const PLANS = [
    {
        id: 'weight-loss',
        title: 'Weight Loss',
        icon: Flame,
        color: 'emerald',
        desc: 'Low calorie, high protein meals to help shed pounds.',
        suggestedCategories: ['Breakfast', 'Main', 'Snacks'],
        maxCalories: 400
    },
    {
        id: 'keto',
        title: 'Keto Diet',
        icon: Leaf,
        color: 'blue',
        desc: 'High fat, low carb options. Focus on Paneer and Ghee.',
        suggestedFoods: ['Paneer Butter Masala', 'Omelette (2 eggs)', 'Palak Paneer', 'Butter Chicken'], // Explicit overrides
        maxCalories: 600
    },
    {
        id: 'weight-gain',
        title: 'Muscle Gain',
        icon: Dumbbell,
        color: 'purple',
        desc: 'Calorie dense meals for building mass and strength.',
        suggestedCategories: ['Main', 'Breakfast', 'Snacks'],
        minCalories: 300
    },
];

const Meals = ({ onAddFood }) => {
    const [activePlan, setActivePlan] = useState(null);

    const getPlanFoods = (plan) => {
        if (plan.suggestedFoods) {
            return INDIAN_FOODS.filter(f => plan.suggestedFoods.includes(f.name));
        }

        return INDIAN_FOODS.filter(f => {
            if (plan.maxCalories && f.calories > plan.maxCalories) return false;
            if (plan.minCalories && f.calories < plan.minCalories) return false;
            return true;
        }).slice(0, 8); // Just show top 8 matches
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {!activePlan ? (
                <>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Choose Your Diet Plan</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Select a goal to see tailored meal suggestions</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PLANS.map((plan) => {
                            const Icon = plan.icon;
                            const colors = {
                                emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 hover:border-emerald-200',
                                blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 hover:border-blue-200',
                                purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500 hover:border-purple-200',
                            };

                            return (
                                <button
                                    key={plan.id}
                                    onClick={() => setActivePlan(plan)}
                                    className={`p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${colors[plan.color]}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-sm">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100">{plan.title}</h3>
                                    <p className="text-sm opacity-80 leading-relaxed text-slate-700 dark:text-slate-300">{plan.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <button
                        onClick={() => setActivePlan(null)}
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Plans
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <activePlan.icon size={24} className="text-slate-700 dark:text-slate-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activePlan.title} Suggestions</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Recommended meals based on your goal</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getPlanFoods(activePlan).map((food, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 soft-shadow flex justify-between items-center group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">{food.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">{food.category}</span>
                                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">{food.calories} kcal</span>
                                    </div>
                                </div>
                                {/* Note: This button is illustrative as we don't have direct add context to a specific meal time here yet without more complex state lifting, 
                            but keeping it prepared for future use or just as a list view */}
                                <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-400">
                                    <ChefHat size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default Meals;
