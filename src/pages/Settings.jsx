import React, { useState, useEffect } from 'react';
import { Save, Ruler, Weight, Activity, Target, Flame } from 'lucide-react';
import clsx from 'clsx';
import { useSessionContext } from '../context/SessionContext';

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Lightly Active', desc: 'Exercise 1-3 times/week' },
    { value: 'moderate', label: 'Moderately Active', desc: 'Exercise 4-5 times/week' },
    { value: 'active', label: 'Very Active', desc: 'Exercise daily or intense' },
];

const GOALS = [
    { value: 'lose', label: 'Weight Loss', desc: 'Deficit of ~500 cal/day' },
    { value: 'maintain', label: 'Maintain Weight', desc: 'Eat according to TDEE' },
    { value: 'gain', label: 'Weight Gain', desc: 'Surplus of ~500 cal/day' },
];

const Settings = () => {
    const { profile: contextProfile, saveProfile } = useSessionContext();

    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('calorieCoachProfile');
        return saved ? JSON.parse(saved) : {
            gender: 'male',
            age: 25,
            height: 175,
            weight: 70,
            activity: 'moderate',
            goal: 'maintain',
            units: 'metric',
            burnedGoal: 450,
            stepsGoal: 6000,
            distanceGoal: 3.2
        };
    });

    // Sync local form state when context profile loads from Supabase
    useEffect(() => {
        if (contextProfile) setProfile(contextProfile);
    }, [contextProfile]);

    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updates = { [name]: value };

        // Sync activity targets (base ratio: 6000 steps = 3.2 km = 450 kcal)
        if (value !== '') {
            const numVal = Number(value);
            if (name === 'burnedGoal') {
                const steps = Math.round(numVal / 0.075);
                updates.stepsGoal = steps;
                updates.distanceGoal = parseFloat((steps / 1875).toFixed(2));
            } else if (name === 'stepsGoal') {
                updates.burnedGoal = Math.round(numVal * 0.075);
                updates.distanceGoal = parseFloat((numVal / 1875).toFixed(2));
            } else if (name === 'distanceGoal') {
                const steps = Math.round(numVal * 1875);
                updates.stepsGoal = steps;
                updates.burnedGoal = Math.round(steps * 0.075);
            }
        }

        setProfile(prev => ({ ...prev, ...updates }));
        setIsSaved(false);
    };

    const calculateGoal = () => {
        // Mifflin-St Jeor Equation
        let bmr;
        if (profile.gender === 'male') {
            bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
        } else {
            bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        }

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725
        };

        const tdee = bmr * activityMultipliers[profile.activity];

        let targetCalories = tdee;
        if (profile.goal === 'lose') targetCalories -= 500;
        if (profile.goal === 'gain') targetCalories += 500;

        return Math.round(targetCalories);
    };

    const isFormValid = 
        profile.age !== '' && 
        profile.height !== '' && 
        profile.weight !== '' && 
        profile.burnedGoal !== '' && 
        profile.stepsGoal !== '' && 
        profile.distanceGoal !== '';

    const handleSave = (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        saveProfile(profile); // updates context → Dashboard re-renders instantly
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 soft-shadow transition-colors">
                <div className="flex items-center justify-between mb-8 text-slate-800 dark:text-slate-100">
                    <h2 className="text-xl font-bold">Personal Profile</h2>
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                        Daily Target: {calculateGoal()} kcal
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-all"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={profile.age}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-all"
                            />
                        </div>
                    </div>

                    {/* Measurements */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Ruler size={16} className="text-slate-400" />
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                name="height"
                                value={profile.height}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Weight size={16} className="text-slate-400" />
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={profile.weight}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-all"
                            />
                        </div>
                    </div>

                    {/* Activity Level */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Activity size={16} className="text-slate-400" />
                            Activity Level
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ACTIVITY_LEVELS.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => {
                                        setProfile(prev => ({ ...prev, activity: level.value }));
                                        setIsSaved(false);
                                    }}
                                    className={clsx(
                                        "p-3 rounded-xl border text-left transition-all",
                                        profile.activity === level.value
                                            ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-500"
                                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800"
                                    )}
                                >
                                    <div className={clsx("font-semibold text-sm", profile.activity === level.value ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300")}>
                                        {level.label}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{level.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Target size={16} className="text-slate-400" />
                            Primary Goal
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {GOALS.map((goal) => (
                                <button
                                    key={goal.value}
                                    type="button"
                                    onClick={() => {
                                        setProfile(prev => ({ ...prev, goal: goal.value }));
                                        setIsSaved(false);
                                    }}
                                    className={clsx(
                                        "p-3 rounded-xl border text-center transition-all",
                                        profile.goal === goal.value
                                            ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-500"
                                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800"
                                    )}
                                >
                                    <div className={clsx("font-semibold text-sm", profile.goal === goal.value ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300")}>
                                        {goal.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Targets */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Flame size={16} className="text-slate-400" />
                            Daily Activity Targets
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">Burned (kcal)</label>
                                <input
                                    type="number"
                                    name="burnedGoal"
                                    value={profile.burnedGoal || 450}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">Steps</label>
                                <input
                                    type="number"
                                    name="stepsGoal"
                                    value={profile.stepsGoal || 6000}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">Distance (km)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="distanceGoal"
                                    value={profile.distanceGoal || 3.2}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-md",
                                !isFormValid ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50" :
                                isSaved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                            )}
                        >
                            <Save size={18} />
                            {isSaved ? 'Saved!' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
