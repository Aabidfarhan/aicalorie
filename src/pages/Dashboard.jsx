import React, { useState, useEffect } from 'react';
import { Flame, Utensils, Moon, Sun, Coffee, Footprints } from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import MealCard from '../components/MealCard';
import WeeklyChart from '../components/WeeklyChart';
import MacroOverview from '../components/MacroOverview';
import WaterTracker from '../components/WaterTracker';
import { useSessionContext } from '../context/SessionContext';

const todayStr = () => new Date().toISOString().split('T')[0];

const emptyMeals = () => ({
    breakfast: { calories: 0, items: [] },
    lunch:     { calories: 0, items: [] },
    dinner:    { calories: 0, items: [] },
    snacks:    { calories: 0, items: [] },
});

const Dashboard = () => {
    const { loadDailyLog, saveDailyLog, calorieGoal, activityTargets, selectedDate } = useSessionContext();
    const isToday = selectedDate === todayStr();

    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('calorieCoachData');
        return saved ? JSON.parse(saved) : { lastSavedDate: todayStr(), meals: emptyMeals(), water: 0, history: [] };
    });

    // Reload whenever selected date changes
    useEffect(() => {
        if (isToday) {
            loadDailyLog().then(remote => {
                if (remote) setData(prev => ({ ...prev, ...remote }));
            });
        } else {
            loadDailyLog(selectedDate).then(remote => {
                if (remote) setData({ lastSavedDate: selectedDate, meals: remote.meals || emptyMeals(), water: remote.water || 0, history: [] });
                else        setData({ lastSavedDate: selectedDate, meals: emptyMeals(), water: 0, history: [] });
            });
        }
    }, [selectedDate, loadDailyLog, isToday]);

    // Date rollover — only relevant for today
    useEffect(() => {
        if (!isToday) return;
        const today = todayStr();
        const lastDate = data.lastSavedDate || today;
        if (lastDate !== today) {
            const totalYesterday = Object.values(data.meals).reduce((acc, m) => acc + m.calories, 0);
            setData(prev => ({
                ...prev,
                lastSavedDate: today,
                meals: emptyMeals(),
                water: 0,
                history: [...prev.history, { date: lastDate, calories: totalYesterday }].slice(-6)
            }));
        }
    }, [isToday]);

    // Persist — only save when viewing today
    useEffect(() => {
        if (isToday) saveDailyLog(data);
    }, [data, saveDailyLog, isToday]);

    const totalConsumed = Object.values(data.meals).reduce((acc, meal) => acc + meal.calories, 0);
    const remaining = calorieGoal - totalConsumed;
    const progressPercentage = Math.min(100, (totalConsumed / calorieGoal) * 100);

    const allItems = [
        ...data.meals.breakfast.items,
        ...data.meals.lunch.items,
        ...data.meals.dinner.items,
        ...data.meals.snacks.items
    ];
    const totalProtein = allItems.reduce((acc, item) => acc + (item.protein || 0), 0);
    const totalCarbs   = allItems.reduce((acc, item) => acc + (item.carbs   || 0), 0);
    const totalFat     = allItems.reduce((acc, item) => acc + (item.fat     || 0), 0);

    const getDayName = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    const chartData = [
        ...data.history.map(h => ({ day: getDayName(h.date), calories: h.calories, isActive: false })),
        { day: isToday ? 'Today' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }), calories: totalConsumed, isActive: true }
    ];

    const addCalories = (mealType, foodItem) => {
        if (!isToday) return; // read-only for past dates
        const item = typeof foodItem === 'number' ? { name: 'Manual Entry', calories: foodItem } : foodItem;
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
            {!isToday && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400 font-medium">
                    Viewing past record — adding meals is disabled for past dates.
                </div>
            )}

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={isToday ? 'Consumed Today' : 'Consumed'} value={totalConsumed} unit="kcal" icon={Flame} trend={+2.4} />

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 soft-shadow flex items-center justify-between relative overflow-hidden transition-all duration-300">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Daily Goal</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{calorieGoal}</span>
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

                <StatCard title="Burned (Est.)" value={activityTargets.burnedGoal} unit="kcal" icon={Footprints} color="orange" subtitle={`from ${activityTargets.stepsGoal} steps`} subValue={`${activityTargets.distanceGoal}km`} />
            </div>

            {/* Water Tracker */}
            <WaterTracker
                water={data.water || 0}
                setWater={(w) => { if (isToday) setData(prev => ({ ...prev, water: w })); }}
            />

            {/* Charts & Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[22rem]">
                <div className="lg:col-span-2 h-full"><WeeklyChart data={chartData} /></div>
                <div className="h-full flex flex-col gap-6">
                    <MacroOverview protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
                </div>
            </div>

            {/* Meals Grid */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                    {isToday ? "Today's Meals" : "Meals"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MealCard title="Breakfast" icon={Coffee}   calories={data.meals.breakfast.calories} items={data.meals.breakfast.items} onAddCalories={(cal) => addCalories('breakfast', cal)} readOnly={!isToday} />
                    <MealCard title="Lunch"     icon={Utensils} calories={data.meals.lunch.calories}     items={data.meals.lunch.items}     onAddCalories={(cal) => addCalories('lunch', cal)}     readOnly={!isToday} />
                    <MealCard title="Dinner"    icon={Moon}     calories={data.meals.dinner.calories}    items={data.meals.dinner.items}    onAddCalories={(cal) => addCalories('dinner', cal)}    readOnly={!isToday} />
                    <MealCard title="Snacks"    icon={Sun}      calories={data.meals.snacks.calories}    items={data.meals.snacks.items}    onAddCalories={(cal) => addCalories('snacks', cal)}    readOnly={!isToday} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
