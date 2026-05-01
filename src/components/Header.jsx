import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <header className="h-16 flex items-center justify-between px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm fixed top-0 right-0 left-64 z-40 border-b border-white/20 dark:border-slate-700/50 transition-colors duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">{title}</h2>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search healthy foods..."
                        className="pl-10 pr-4 py-2 rounded-full bg-white dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-sm w-64 shadow-sm text-slate-600 dark:text-slate-200 placeholder:text-slate-400"
                    />
                </div>

                <button className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200"> ARSHATH</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Free Plan</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                        AR
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
