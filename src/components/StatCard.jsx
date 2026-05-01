import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, unit, icon: Icon, trend, color, subValue, subtitle }) => {
    const colorStyles = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 soft-shadow hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-xl", colorStyles[color || 'emerald'])}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                        trend > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
                    <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{unit}</span>
                </div>
                {subValue && (
                    <p className="text-xs text-slate-400 mt-2">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{subValue}</span> {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
