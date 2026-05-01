import React from 'react';
import { LayoutDashboard, Utensils, TrendingUp, Bot, Settings, Moon, Sun, MessageSquare, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useSessionContext } from '../context/SessionContext';

const Sidebar = ({ activePage, setActivePage, darkMode, toggleDarkMode }) => {
    const { signOut } = useSessionContext();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
        { id: 'meals',     label: 'Meals',        icon: Utensils },
        { id: 'chatbot',   label: 'AI Chat',      icon: MessageSquare },
        { id: 'progress',  label: 'Progress',     icon: TrendingUp },
        { id: 'coach',     label: 'Tips & Tricks',icon: Bot },
        { id: 'settings',  label: 'Settings',     icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-50 transition-colors duration-300">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                    Calorie Coach
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={clsx(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
                                isActive
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                            )}
                        >
                            <Icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>

                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Bot size={16} />
                        </div>
                        <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Pro Tip</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        Drink a glass of water before each meal to help digestion.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
