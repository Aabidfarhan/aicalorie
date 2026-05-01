import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import clsx from 'clsx';

const today = () => new Date().toISOString().split('T')[0];

function shiftDate(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function formatDisplay(dateStr) {
    const t = today();
    if (dateStr === t) return 'Today';
    const yesterday = shiftDate(t, -1);
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

const DateNav = ({ selectedDate, setSelectedDate, className }) => {
    const isToday = selectedDate === today();

    return (
        <div className={clsx('flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 shadow-sm', className)}>
            <button
                onClick={() => setSelectedDate(d => shiftDate(d, -1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
            >
                <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 px-2 min-w-[110px] justify-center">
                <CalendarDays size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatDisplay(selectedDate)}
                </span>
            </div>

            <button
                onClick={() => setSelectedDate(d => shiftDate(d, 1))}
                disabled={isToday}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>

            {!isToday && (
                <button
                    onClick={() => setSelectedDate(today())}
                    className="ml-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap"
                >
                    Go to Today
                </button>
            )}
        </div>
    );
};

export default DateNav;
export { shiftDate, today };
