import React, { useState } from 'react';
import { Lightbulb, Flame, Dumbbell, Apple, Moon, Droplets, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { useSessionContext } from '../context/SessionContext';

const CATEGORIES = [
    {
        id: 'weight-loss',
        label: 'Weight Loss',
        icon: Flame,
        color: 'emerald',
        tips: [
            { title: 'Eat in a calorie deficit', body: 'Aim for 300–500 kcal below your TDEE daily. This creates steady fat loss of ~0.5 kg/week without muscle loss.' },
            { title: 'Prioritise protein', body: 'Eat 1.6–2g of protein per kg of body weight. Protein keeps you full longer and preserves muscle while cutting.' },
            { title: 'Don\'t skip breakfast', body: 'A protein-rich breakfast (eggs, Greek yogurt, sprouts) reduces hunger hormones and prevents overeating later.' },
            { title: 'Eat slowly', body: 'It takes ~20 minutes for your brain to register fullness. Eating slowly reduces total intake by up to 10%.' },
            { title: 'Avoid liquid calories', body: 'Juices, sodas, and sweet chai add 200–400 kcal without making you feel full. Stick to water, black coffee, or chaas.' },
            { title: 'Fill half your plate with vegetables', body: 'Low-calorie, high-fibre veggies like spinach, cucumber, and broccoli add volume without the calories.' },
            { title: 'Sleep 7–8 hours', body: 'Poor sleep raises ghrelin (hunger hormone) and lowers leptin (fullness hormone), making you eat 300+ extra kcal the next day.' },
            { title: 'Walk after meals', body: 'A 10–15 minute walk after eating improves insulin sensitivity and burns an extra 50–80 kcal per meal.' },
        ]
    },
    {
        id: 'muscle-gain',
        label: 'Muscle Gain',
        icon: Dumbbell,
        color: 'purple',
        tips: [
            { title: 'Eat in a calorie surplus', body: 'Aim for 250–500 kcal above your TDEE. A lean bulk minimises fat gain while maximising muscle growth.' },
            { title: 'Hit 2g protein per kg', body: 'For muscle building, target 2g of protein per kg of body weight. Spread it across 4–5 meals for best absorption.' },
            { title: 'Time your carbs around workouts', body: 'Eat complex carbs (rice, oats, banana) 1–2 hours before training for energy, and fast carbs right after to replenish glycogen.' },
            { title: 'Don\'t skip post-workout nutrition', body: 'Consume 30–40g protein within 2 hours after training. A whey shake + banana is a quick and effective option.' },
            { title: 'Eat every 3–4 hours', body: 'Frequent meals keep amino acids available for muscle protein synthesis throughout the day.' },
            { title: 'Include creatine-rich foods', body: 'Red meat and fish naturally contain creatine, which supports strength and muscle volume.' },
            { title: 'Track progressive overload', body: 'Nutrition alone won\'t build muscle — ensure you\'re lifting heavier or doing more reps each week.' },
            { title: 'Prioritise sleep for recovery', body: 'Growth hormone is released during deep sleep. 8 hours of quality sleep is as important as your workout.' },
        ]
    },
    {
        id: 'nutrition',
        label: 'Nutrition Basics',
        icon: Apple,
        color: 'orange',
        tips: [
            { title: 'Understand macros', body: 'Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g. Knowing this helps you make smarter food swaps.' },
            { title: 'Eat whole foods first', body: 'Whole grains, legumes, vegetables, and lean proteins are more filling and nutritious than processed alternatives.' },
            { title: 'Don\'t fear carbs', body: 'Carbs are your body\'s primary fuel. Choose complex carbs (brown rice, oats, dal) over refined ones (white bread, maida).' },
            { title: 'Healthy fats are essential', body: 'Nuts, seeds, ghee (in moderation), and fish provide omega-3s and fat-soluble vitamins your body needs.' },
            { title: 'Fibre is your friend', body: 'Aim for 25–35g of fibre daily from vegetables, fruits, and legumes. It improves digestion and keeps you full.' },
            { title: 'Read food labels', body: 'Check serving size, calories, and sugar content. Many "healthy" packaged foods are high in hidden sugars and sodium.' },
            { title: 'Limit ultra-processed foods', body: 'Chips, biscuits, and instant noodles are calorie-dense and nutrient-poor. Limit to occasional treats.' },
            { title: 'Spice up your meals', body: 'Turmeric, cumin, coriander, and ginger have anti-inflammatory properties and add flavour without calories.' },
        ]
    },
    {
        id: 'hydration',
        label: 'Hydration',
        icon: Droplets,
        color: 'blue',
        tips: [
            { title: 'Drink 2.5–3L of water daily', body: 'Most adults need 35ml per kg of body weight. Increase this on hot days or when exercising.' },
            { title: 'Drink water before meals', body: 'Drinking 500ml of water 30 minutes before a meal can reduce calorie intake by 13% and aid digestion.' },
            { title: 'Don\'t wait until you\'re thirsty', body: 'Thirst is a sign you\'re already mildly dehydrated. Sip water consistently throughout the day.' },
            { title: 'Coconut water for electrolytes', body: 'After intense workouts, coconut water replenishes sodium, potassium, and magnesium naturally.' },
            { title: 'Limit sugary drinks', body: 'A single glass of mango juice or sweet lassi can have 200–300 kcal. Opt for nimbu pani or plain chaas instead.' },
            { title: 'Morning hydration matters', body: 'Drink 1–2 glasses of water first thing in the morning to kickstart metabolism and flush out toxins.' },
        ]
    },
    {
        id: 'sleep',
        label: 'Sleep & Recovery',
        icon: Moon,
        color: 'indigo',
        tips: [
            { title: 'Sleep is when you grow', body: 'Muscle repair and fat burning both happen during sleep. Cutting sleep short undermines all your diet and gym efforts.' },
            { title: 'Avoid heavy meals before bed', body: 'Eating a large meal within 2 hours of sleep disrupts digestion and reduces sleep quality.' },
            { title: 'A light protein snack is fine', body: 'Casein-rich foods like curd or a small bowl of paneer before bed provide slow-release protein overnight.' },
            { title: 'Consistent sleep schedule', body: 'Going to bed and waking at the same time regulates your hunger hormones and improves metabolic health.' },
            { title: 'Limit screens before bed', body: 'Blue light from phones suppresses melatonin. Avoid screens 30–60 minutes before sleep for better recovery.' },
        ]
    },
    {
        id: 'mindset',
        label: 'Mindset & Habits',
        icon: Brain,
        color: 'pink',
        tips: [
            { title: 'Track everything, judge nothing', body: 'Logging food without guilt gives you data to improve. One bad meal doesn\'t ruin progress — consistency does.' },
            { title: 'Progress over perfection', body: 'Missing one workout or eating one samosa is fine. What matters is your average behaviour over weeks and months.' },
            { title: 'Set process goals, not just outcome goals', body: 'Instead of "lose 5kg", try "log meals daily" or "walk 30 min 5x/week". Process goals build the habits that create results.' },
            { title: 'Meal prep saves you', body: 'Preparing meals in advance removes decision fatigue and reduces the chance of reaching for unhealthy options.' },
            { title: 'Celebrate non-scale victories', body: 'Better energy, improved sleep, clothes fitting better — these matter as much as the number on the scale.' },
            { title: 'Find your why', body: 'A strong personal reason (health, confidence, longevity) keeps you going when motivation fades.' },
        ]
    },
];

const colorMap = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20',  border: 'border-purple-200 dark:border-purple-800',  icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',  badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',  dot: 'bg-purple-500' },
    orange:  { bg: 'bg-orange-50 dark:bg-orange-900/20',  border: 'border-orange-200 dark:border-orange-800',  icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',  badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',  dot: 'bg-orange-500' },
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',      border: 'border-blue-200 dark:border-blue-800',      icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',      badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',      dot: 'bg-blue-500' },
    indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',  border: 'border-indigo-200 dark:border-indigo-800',  icon: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',  badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',  dot: 'bg-indigo-500' },
    pink:    { bg: 'bg-pink-50 dark:bg-pink-900/20',      border: 'border-pink-200 dark:border-pink-800',      icon: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400',      badge: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400',      dot: 'bg-pink-500' },
};

const TipCard = ({ tip, color }) => {
    const [open, setOpen] = useState(false);
    const c = colorMap[color];
    return (
        <button
            onClick={() => setOpen(o => !o)}
            className={clsx(
                'w-full text-left rounded-xl border p-4 transition-all duration-200',
                c.bg, c.border,
                'hover:shadow-sm'
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', c.dot)} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tip.title}</span>
                </div>
                {open ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
            </div>
            {open && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                    {tip.body}
                </p>
            )}
        </button>
    );
};

const Coach = () => {
    const { profile } = useSessionContext();
    const goal = profile?.goal || 'maintain';

    // Put the relevant category first based on user goal
    const sorted = [...CATEGORIES].sort((a, b) => {
        const priority = { lose: 'weight-loss', gain: 'muscle-gain', maintain: 'nutrition' };
        if (a.id === priority[goal]) return -1;
        if (b.id === priority[goal]) return 1;
        return 0;
    });

    const [activeCategory, setActiveCategory] = useState(sorted[0].id);
    const current = sorted.find(c => c.id === activeCategory);
    const c = colorMap[current.color];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tips & Tricks</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                    Science-backed advice tailored to your goal.
                </p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
                {sorted.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    const cc = colorMap[cat.color];
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                                isActive
                                    ? clsx(cc.bg, cc.border, cc.badge)
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                            )}
                        >
                            <Icon size={15} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Tips grid */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className={clsx('p-2 rounded-xl', c.icon)}>
                        <current.icon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{current.label}</h3>
                        <span className="text-xs text-slate-400">{current.tips.length} tips</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {current.tips.map((tip, i) => (
                        <TipCard key={i} tip={tip} color={current.color} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Coach;
