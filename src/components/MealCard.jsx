import React, { useState, useMemo } from 'react';
import { Plus, X, Search, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { INDIAN_FOODS } from '../data/indianFoods';

const MealCard = ({ title, icon: Icon, calories, onAddCalories, items = [], readOnly = false }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [mode, setMode] = useState('search'); // 'search' or 'manual'
    const [searchTerm, setSearchTerm] = useState('');
    const [manualCalories, setManualCalories] = useState('');
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const filteredFoods = useMemo(() => {
        if (!searchTerm) return [];
        return INDIAN_FOODS.filter(food =>
            food.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5); // Limit to 5 results
    }, [searchTerm]);

    const handleAdd = (food) => {
        onAddCalories(food);
        resetForm();
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualCalories) return;
        onAddCalories({ name: 'Manual Entry', calories: parseInt(manualCalories) });
        resetForm();
    };

    const resetForm = () => {
        setSearchTerm('');
        setManualCalories('');
        setSelectedFood(null);
        setQuantity(1);
        setIsAdding(false);
        setMode('search');
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 soft-shadow flex flex-col h-full hover:border-emerald-100 dark:hover:border-emerald-900 transition-colors group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800/50 transition-colors">
                        <Icon size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{calories} kcal</p>
                    </div>
                </div>
                {!readOnly && (<button
                    onClick={() => setIsAdding(!isAdding)}
                    className={clsx(
                        "p-2 rounded-lg transition-all duration-200",
                        isAdding ? "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500 hover:text-white"
                    )}
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                </button>)}
            </div>

            {isAdding ? (
                <div className="mt-auto z-10 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-2 mb-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                        <button
                            className={clsx("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", mode === 'search' ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400")}
                            onClick={() => setMode('search')}
                        >
                            Search Food
                        </button>
                        <button
                            className={clsx("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", mode === 'manual' ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400")}
                            onClick={() => setMode('manual')}
                        >
                            Manual
                        </button>
                    </div>

                    {mode === 'search' ? (
                        <div className="relative">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search Indian foods..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-slate-200 dark:placeholder:text-slate-600"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedFood(null);
                                    }}
                                />
                            </div>

                            {searchTerm && !selectedFood && (
                                <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                                    {filteredFoods.length > 0 ? (
                                        filteredFoods.map((food, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => { setSelectedFood(food); setQuantity(1); }}
                                                className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-slate-700 flex justify-between items-center group transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                            >
                                                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{food.name}</span>
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{food.calories} kcal</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-400">
                                            No foods found
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedFood && (
                                <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-lg p-3">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{selectedFood.name}</span>
                                        <span className="text-xs text-slate-500">{selectedFood.calories} kcal / unit</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                                            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700">-</button>
                                            <span className="text-sm font-medium w-4 text-center dark:text-slate-200">{quantity}</span>
                                            <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700">+</button>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                handleAdd({
                                                    ...selectedFood,
                                                    name: quantity > 1 ? `${selectedFood.name} (x${quantity})` : selectedFood.name,
                                                    calories: selectedFood.calories * quantity,
                                                    protein: selectedFood.protein ? selectedFood.protein * quantity : 0,
                                                    carbs: selectedFood.carbs ? selectedFood.carbs * quantity : 0,
                                                    fat: selectedFood.fat ? selectedFood.fat * quantity : 0
                                                });
                                            }}
                                            className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Add ({selectedFood.calories * quantity} kcal)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="relative">
                            <input
                                type="number"
                                min="1"
                                autoFocus
                                placeholder="Enter calories..."
                                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-slate-200"
                                value={manualCalories}
                                onChange={(e) => setManualCalories(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!manualCalories || Number(manualCalories) < 1}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="space-y-2 mt-auto overflow-y-auto max-h-[240px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 pr-1">
                    {items.length > 0 ? (
                        <ul className="text-sm text-slate-500 space-y-2">
                            {items.slice().reverse().map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={item.name || "Meal"}>
                                        {item.name || `Entry ${items.length - idx}`}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">{item.calories} kcal</span>
                                </li>
                            ))}




                            )}
                        </ul>
                    ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 p-4">
                            <p className="text-xs text-slate-400 font-medium">No meals logged</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MealCard;
