import React, { useState, useEffect } from 'react';
import { Flame, Utensils, Moon, Sun, Coffee, Footprints } from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import MealCard from '../components/MealCard';
import WeeklyChart from '../components/WeeklyChart';
import AICoachCard from '../components/AICoachCard';
import MacroOverview from '../components/MacroOverview';

const DEFAULT_GOAL = 2400;

const INITIAL_DATA = {
    goal: DEFAULT_GOAL,
    lastSavedDate: new Date().toISOString().split('T')[0],
    meals: {
        breakfast: { calories: 0, items: [] },
        lunch: { calories: 0, items: [] },
        dinner: { calories: 0, items: [] },
        snacks: { calories: 0, items: [] },
    },
    // Initialize with empty history or some mock data if needed, but for "Real" feel let's start empty or minimal
    history: []
};

const Dashboard = () => {
    // Load initial state
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('calorieCoachData');
        return saved ? JSON.parse(saved) : INITIAL_DATA;
    });

    const [activityTargets, setActivityTargets] = useState({
        burnedGoal: 450,
        stepsGoal: 6000,
        distanceGoal: 3.2
    });

    // 1. Date Rollover Logic
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = data.lastSavedDate || today;

        if (lastDate !== today) {
            // New day detected! Archive yesterday's data.
            const totalYesterday = Object.values(data.meals).reduce((acc, m) => acc + m.calories, 0);

            // Add yesterday entry if not already present (prevent duplicates if strict effect runs)
            const newEntry = { date: lastDate, calories: totalYesterday };

            setData(prev => ({
                ...prev,
                lastSavedDate: today,
                meals: {
                    breakfast: { calories: 0, items: [] },
                    lunch: { calories: 0, items: [] },
                    dinner: { calories: 0, items: [] },
                    snacks: { calories: 0, items: [] },
                },
                history: [...prev.history, newEntry].slice(-6) // Keep last 6 + today (dyn calc)
            }));
        }
    }, []); // Run once on mount

    // 2. Header / Goal Sync Logic
    useEffect(() => {
        // Sync goal from profile on mount/update
        const profileStr = localStorage.getItem('calorieCoachProfile');
        if (profileStr) {
            const profile = JSON.parse(profileStr);
            const { gender, weight, height, age, activity, goal, burnedGoal, stepsGoal, distanceGoal } = profile;
            
            setActivityTargets({
                burnedGoal: burnedGoal || 450,
                stepsGoal: stepsGoal || 6000,
                distanceGoal: distanceGoal || 3.2
            });
            let bmr;
            if (gender === 'male') {
                bmr = 10 * weight + 6.25 * height - 5 * age + 5;
            } else {
                bmr = 10 * weight + 6.25 * height - 5 * age - 161;
            }
            const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
            let tdee = bmr * (multipliers[activity] || 1.2);
            if (goal === 'lose') tdee -= 500;
            if (goal === 'gain') tdee += 500;

            const newGoal = Math.round(tdee);
            if (data.goal !== newGoal) {
                setData(prev => ({ ...prev, goal: newGoal }));
            }
        }
    }, []);

    // Calculate totals
    const totalConsumed = Object.values(data.meals).reduce((acc, meal) => acc + meal.calories, 0);
    const remaining = data.goal - totalConsumed;
    const progressPercentage = Math.min(100, (totalConsumed / data.goal) * 100);

    // Calculate Macros
    const allItems = [
        ...data.meals.breakfast.items,
        ...data.meals.lunch.items,
        ...data.meals.dinner.items,
        ...data.meals.snacks.items
    ];

    const totalProtein = allItems.reduce((acc, item) => acc + (item.protein || 0), 0);
    const totalCarbs = allItems.reduce((acc, item) => acc + (item.carbs || 0), 0);
    const totalFat = allItems.reduce((acc, item) => acc + (item.fat || 0), 0);

    // Prepare Chart Data (Real History + Today)
    // We need last 7 days. 
    // Map history entries to { day: 'Mon', calories: X, isActive: false }
    // Add Today as the last entry { day: 'Today', calories: totalConsumed, isActive: true }

    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const chartData = [
        ...data.history.map(h => ({
            day: getDayName(h.date),
            calories: h.calories,
            isActive: false
        })),
        {
            day: 'Today',
            calories: totalConsumed,
            isActive: true
        }
    ];

    // Pad chart data to always show 7 bars if needed, or just let it grow
    // For a nice UI, let's just use what we have, maybe pad with empty previous days if really short?
    // Let's stick to showing available history for now.

    // Update history only for persistence (we don't strictly need to update data.history with *today's* live data constantly, 
    // we just visualize it in chartData. But if we want to save today's progress to history array for some reason... 
    // actually, better to keep history as *past* days and chartData as the derived view.)

    // So we REMOVE the useEffect that was updating data.history with totalConsumed live.
    // Instead we rely on chartData derived variable for the Chart.

    // Persist to LocalStorage
    useEffect(() => {
        localStorage.setItem('calorieCoachData', JSON.stringify(data));
    }, [data]);

    const addCalories = (mealType, foodItem) => {
        // foodItem can be an object { name, calories } or just calories number (legacy/manual)
        const item = typeof foodItem === 'number'
            ? { name: 'Manual Entry', calories: foodItem }
            : foodItem;

        setData(prev => ({
            ...prev,
            meals: {
                ...prev.meals,
                [mealType]: {
                    calories: prev.meals[mealType].calories + item.calories,
                    items: [...prev.meals[mealType].items, item]
                }
            }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Consumed Today"
                    value={totalConsumed}
                    unit="kcal"
                    icon={Flame}
                    trend={+2.4}
                />


                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 soft-shadow flex items-center justify-between relative overflow-hidden transition-all duration-300">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Daily Goal</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.goal}</span>
                            <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">kcal</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                            <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{remaining}</span> kcal remaining
                        </p>
                    </div>
                    <div className="h-24 w-24 flex-shrink-0">
                        <ProgressRing radius={48} stroke={8} progress={progressPercentage} />
                    </div>
                </div>



                <StatCard
                    title="Burned (Est.)"
                    value={activityTargets.burnedGoal}
                    unit="kcal"
                    icon={Footprints}
                    color="orange"
                    subtitle={`from ${activityTargets.stepsGoal} steps`}
                    subValue={`${activityTargets.distanceGoal}km`}
                />
            </div>

            {/* Charts & Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[22rem]">
                <div className="lg:col-span-2 h-full">
                    <WeeklyChart data={chartData} />
                </div>
                <div className="h-full flex flex-col gap-6">
                    <MacroOverview protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
                </div>
            </div>

            {/* Meals Grid */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Today's Meals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MealCard
                        title="Breakfast"
                        icon={Coffee}
                        calories={data.meals.breakfast.calories}
                        items={data.meals.breakfast.items}
                        onAddCalories={(cal) => addCalories('breakfast', cal)}
                    />
                    <MealCard
                        title="Lunch"
                        icon={Utensils}
                        calories={data.meals.lunch.calories}
                        items={data.meals.lunch.items}
                        onAddCalories={(cal) => addCalories('lunch', cal)}
                    />
                    <MealCard
                        title="Dinner"
                        icon={Moon}
                        calories={data.meals.dinner.calories}
                        items={data.meals.dinner.items}
                        onAddCalories={(cal) => addCalories('dinner', cal)}
                    />
                    <MealCard
                        title="Snacks"
                        icon={Sun}
                        calories={data.meals.snacks.calories}
                        items={data.meals.snacks.items}
                        onAddCalories={(cal) => addCalories('snacks', cal)}
                    />
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
