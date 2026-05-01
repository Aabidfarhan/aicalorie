import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import clsx from 'clsx';
import { useSessionContext } from '../context/SessionContext';
import { supabase } from '../lib/supabase';

// â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pad = (n) => String(n).padStart(2, '0');
const toDateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const today = () => new Date().toISOString().split('T')[0];

function classifyDay(consumed, goal) {
    if (!consumed || !goal) return 'empty';
    const diff = consumed - goal;
    if (diff < -100) return 'loss';       // meaningful deficit
    if (diff > 100)  return 'gain';       // meaningful surplus
    return 'maintain';
}

const DAY_COLORS = {
    loss:     'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-emerald-300',
    gain:     'bg-purple-100  dark:bg-purple-900/40  text-purple-700  dark:text-purple-300  ring-purple-300',
    maintain: 'bg-blue-100    dark:bg-blue-900/40    text-blue-700    dark:text-blue-300    ring-blue-300',
    empty:    'bg-slate-50    dark:bg-slate-800      text-slate-400   dark:text-slate-600',
    today:    'ring-2 ring-emerald-500',
};

// SVG progress ring
function Ring({ pct, size = 56, stroke = 5, color, label, value }) {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(pct, 100) / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size/2} cy={size/2} r={r} fill="none"
                        stroke="currentColor" strokeWidth={stroke}
                        className="text-slate-200 dark:text-slate-700" />
                    <circle cx={size/2} cy={size/2} r={r} fill="none"
                        stroke="currentColor" strokeWidth={stroke}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={clsx(color, 'transition-all duration-700 ease-out')} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        {Math.round(pct)}%
                    </span>
                </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{value}</span>
        </div>
    );
}

// â”€â”€ main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Progress() {
    const { userId, profile, calorieGoal, selectedDate, setSelectedDate } = useSessionContext();
    const goal = profile?.goal || 'maintain';

    const now = new Date();
    const [viewYear,  setViewYear]  = useState(() => new Date(selectedDate + 'T00:00:00').getFullYear());
    const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate + 'T00:00:00').getMonth());
    // selected date comes from shared context (selectedDate)

    // Map of date â†’ { calories, protein, carbs, fat, water }
    const [logs, setLogs] = useState({});
    // Map of date â†’ weight (kg) entered by user
    const [weights, setWeights] = useState({});
    const [weightInput, setWeightInput] = useState('');
    const [saving, setSaving] = useState(false);

    // â”€â”€ fetch daily_logs for the visible month â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchLogs = useCallback(async () => {
        const firstDay = `${viewYear}-${pad(viewMonth + 1)}-01`;
        const lastDay  = `${viewYear}-${pad(viewMonth + 1)}-${new Date(viewYear, viewMonth + 1, 0).getDate()}`;

        if (supabase && userId) {
            const { data } = await supabase
                .from('daily_logs')
                .select('log_date, meals, water')
                .eq('user_id', userId)
                .gte('log_date', firstDay)
                .lte('log_date', lastDay);

            if (data) {
                const map = {};
                data.forEach(row => {
                    const items = Object.values(row.meals || {}).flatMap(m => m.items || []);
                    map[row.log_date] = {
                        calories: Object.values(row.meals || {}).reduce((a, m) => a + (m.calories || 0), 0),
                        protein:  items.reduce((a, i) => a + (i.protein || 0), 0),
                        carbs:    items.reduce((a, i) => a + (i.carbs   || 0), 0),
                        fat:      items.reduce((a, i) => a + (i.fat     || 0), 0),
                        water:    row.water || 0,
                    };
                });
                setLogs(map);
            }
        } else {
            // localStorage fallback â€” only today's data available
            const raw = localStorage.getItem('calorieCoachData');
            if (raw) {
                const d = JSON.parse(raw);
                const t = today();
                const items = Object.values(d.meals || {}).flatMap(m => m.items || []);
                setLogs({
                    [t]: {
                        calories: Object.values(d.meals || {}).reduce((a, m) => a + (m.calories || 0), 0),
                        protein:  items.reduce((a, i) => a + (i.protein || 0), 0),
                        carbs:    items.reduce((a, i) => a + (i.carbs   || 0), 0),
                        fat:      items.reduce((a, i) => a + (i.fat     || 0), 0),
                        water:    d.water || 0,
                    }
                });
            }
        }
    }, [viewYear, viewMonth, userId]);

    // â”€â”€ fetch weight logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchWeights = useCallback(async () => {
        if (!supabase || !userId) return;
        const firstDay = `${viewYear}-${pad(viewMonth + 1)}-01`;
        const lastDay  = `${viewYear}-${pad(viewMonth + 1)}-${new Date(viewYear, viewMonth + 1, 0).getDate()}`;
        const { data } = await supabase
            .from('progress_logs')
            .select('log_date, weight_kg')
            .eq('user_id', userId)
            .gte('log_date', firstDay)
            .lte('log_date', lastDay);
        if (data) {
            const map = {};
            data.forEach(r => { map[r.log_date] = r.weight_kg; });
            setWeights(map);
        }
    }, [viewYear, viewMonth, userId]);

    useEffect(() => { fetchLogs(); fetchWeights(); }, [fetchLogs, fetchWeights]);

    // Sync calendar view when selectedDate changes from header DateNav
    useEffect(() => {
        const d = new Date(selectedDate + 'T00:00:00');
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    }, [selectedDate]);

    // pre-fill weight input when selected date changes
    useEffect(() => {
        setWeightInput(weights[selectedDate] ? String(weights[selectedDate]) : '');
    }, [selected, weights]);

    // â”€â”€ save weight â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const saveWeight = async () => {
        const kg = parseFloat(weightInput);
        if (!kg || kg < 1) return;
        setSaving(true);
        setWeights(prev => ({ ...prev, [selectedDate]: kg }));
        if (supabase && userId) {
            await supabase.from('progress_logs').upsert(
                { user_id: userId, log_date: selectedDate, weight_kg: kg, updated_at: new Date().toISOString() },
                { onConflict: 'user_id,log_date' }
            );
        }
        setSaving(false);
    };

    // â”€â”€ calendar helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    // â”€â”€ selected day data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const selData   = logs[selectedDate] || null;
    const selWeight = weights[selectedDate] || null;
    const selClass  = selData ? classifyDay(selData.calories, calorieGoal) : 'empty';

    const proteinTarget = goal === 'gain' ? 150 : goal === 'lose' ? 130 : 120;
    const carbTarget    = goal === 'lose' ? 180 : goal === 'gain' ? 300 : 250;
    const fatTarget     = goal === 'gain' ? 80  : goal === 'lose' ? 55  : 70;

    const statusConfig = {
        loss:    { label: 'Calorie Deficit',  icon: TrendingDown, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        gain:    { label: 'Calorie Surplus',  icon: TrendingUp,   color: 'text-purple-600  dark:text-purple-400',  bg: 'bg-purple-50  dark:bg-purple-900/30'  },
        maintain:{ label: 'On Track',         icon: Minus,        color: 'text-blue-600    dark:text-blue-400',    bg: 'bg-blue-50    dark:bg-blue-900/30'    },
        empty:   { label: 'No data',          icon: Minus,        color: 'text-slate-400',                         bg: 'bg-slate-50   dark:bg-slate-800'      },
    };
    const status = statusConfig[selClass];

    // weight trend (last 2 entries with data)
    const weightEntries = Object.entries(weights).sort(([a],[b]) => a.localeCompare(b));
    const latestTwo = weightEntries.slice(-2);
    const weightDiff = latestTwo.length === 2 ? (latestTwo[1][1] - latestTwo[0][1]).toFixed(1) : null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Progress</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                    Day-wise calorie tracking and weight history.
                </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs font-medium">
                {[
                    { color: 'bg-emerald-400', label: 'Deficit (Weight Loss)' },
                    { color: 'bg-purple-400',  label: 'Surplus (Muscle Gain)' },
                    { color: 'bg-blue-400',    label: 'Maintenance' },
                    { color: 'bg-slate-200 dark:bg-slate-700', label: 'No data' },
                ].map(l => (
                    <span key={l.label} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className={clsx('w-3 h-3 rounded-full', l.color)} />
                        {l.label}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* â”€â”€ Calendar â”€â”€ */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 soft-shadow">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <ChevronLeft size={18} className="text-slate-500" />
                        </button>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </span>
                        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <ChevronRight size={18} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 mb-2">
                        {DAY_LABELS.map(d => (
                            <div key={d} className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* empty cells before first day */}
                        {Array.from({ length: firstWeekday }).map((_, i) => (
                            <div key={`e${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = toDateStr(viewYear, viewMonth, day);
                            const dayLog  = logs[dateStr];
                            const cls     = dayLog ? classifyDay(dayLog.calories, calorieGoal) : 'empty';
                            const isToday = dateStr === today();
                            const isSel   = dateStr === selectedDate;
                            const hasWeight = !!weights[dateStr];

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={clsx(
                                        'relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all',
                                        DAY_COLORS[cls],
                                        isToday && 'ring-2 ring-emerald-500',
                                        isSel   && 'ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500 scale-105 shadow-md',
                                    )}
                                >
                                    {day}
                                    {hasWeight && (
                                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-60" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* â”€â”€ Day Detail Panel â”€â”€ */}
                <div className="space-y-4">
                    {/* Date header */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 soft-shadow">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                            {new Date(selected + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {/* Status badge */}
                        <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl mb-4', status.bg)}>
                            <status.icon size={16} className={status.color} />
                            <span className={clsx('text-sm font-semibold', status.color)}>{status.label}</span>
                        </div>

                        {selData ? (
                            <>
                                {/* Calorie ring */}
                                <div className="flex justify-center mb-4">
                                    <Ring
                                        pct={(selData.calories / calorieGoal) * 100}
                                        size={80} stroke={7}
                                        color={selData.calories > calorieGoal ? 'text-red-500' : 'text-emerald-500'}
                                        label="Calories"
                                        value={`${selData.calories} / ${calorieGoal} kcal`}
                                    />
                                </div>

                                {/* Macro rings */}
                                <div className="grid grid-cols-3 gap-2">
                                    <Ring pct={(selData.protein / proteinTarget) * 100} size={56} stroke={5} color="text-blue-500"   label="Protein" value={`${Math.round(selData.protein)}g`} />
                                    <Ring pct={(selData.carbs   / carbTarget)    * 100} size={56} stroke={5} color="text-orange-400" label="Carbs"   value={`${Math.round(selData.carbs)}g`} />
                                    <Ring pct={(selData.fat     / fatTarget)     * 100} size={56} stroke={5} color="text-yellow-500" label="Fat"     value={`${Math.round(selData.fat)}g`} />
                                </div>

                                {/* Calorie diff */}
                                <div className="mt-4 text-center">
                                    {(() => {
                                        const diff = selData.calories - calorieGoal;
                                        return (
                                            <span className={clsx('text-xs font-semibold', diff > 0 ? 'text-red-500' : 'text-emerald-500')}>
                                                {diff > 0 ? `+${diff}` : diff} kcal vs goal
                                            </span>
                                        );
                                    })()}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No meals logged for this day.</p>
                        )}
                    </div>

                    {/* Weight log */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 soft-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <Scale size={16} className="text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Weight Log</span>
                            {weightDiff !== null && (
                                <span className={clsx('ml-auto text-xs font-semibold', parseFloat(weightDiff) < 0 ? 'text-emerald-500' : 'text-purple-500')}>
                                    {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff} kg trend
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="0.1"
                                min="1"
                                placeholder="e.g. 72.5"
                                value={weightInput}
                                onChange={e => setWeightInput(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200"
                            />
                            <button
                                onClick={saveWeight}
                                disabled={saving || !weightInput}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? '...' : 'Save'}
                            </button>
                        </div>

                        {selWeight && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                Logged: <span className="font-semibold text-slate-600 dark:text-slate-300">{selWeight} kg</span>
                            </p>
                        )}

                        {/* Weight history mini list */}
                        {weightEntries.length > 0 && (
                            <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                                {weightEntries.slice().reverse().slice(0, 6).map(([date, kg]) => (
                                    <div key={date} className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                                        <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        <span className="font-semibold">{kg} kg</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
