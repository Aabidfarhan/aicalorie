import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useSessionContext } from '../context/SessionContext';

// 🛑 NOTICE: The API Key and System Prompt have been removed from here!
// They now live securely in your backend server.

const QUICK_PROMPTS = [
    'How many calories in Idli Sambar?',
    'Best high-protein Indian breakfast?',
    'How to lose 5kg in a month?',
    'What should I eat post-workout?',
    'Is Biryani good for weight loss?',
];

async function callGemini(history, userText) {
    // ✅ This now points to your local Node.js backend
    const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: history,
            userText: userText
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    // Your backend sends back { reply: "..." }
    return data.reply || 'Sorry, I could not generate a response.';
}

export default function Chatbot() {
    const { profile, calorieGoal } = useSessionContext();
    const [messages, setMessages] = useState([{
        id: 1, role: 'assistant',
        text: `Hi! I'm your AI nutrition coach powered by Gemini. I can help with calorie info, meal planning, and wellness tips.\n\nYour current goal: **${calorieGoal} kcal/day** (${profile?.goal === 'lose' ? 'Weight Loss' : profile?.goal === 'gain' ? 'Muscle Gain' : 'Maintenance'}). What would you like to know?`
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = async (text) => {
        if (!text.trim() || isTyping) return;
        setError(null);

        const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Pass only assistant/user messages (not the initial greeting) as history
            const history = messages.filter(m => m.role !== 'assistant' || m.id !== 1);
            const reply = await callGemini(history, text.trim());
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }]);
        } catch (e) {
            setError(e.message);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: `Sorry, something went wrong: ${e.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };
    const clearChat = () => setMessages([{ id: 1, role: 'assistant', text: `Chat cleared. How can I help you?` }]);

    // Simple markdown-ish renderer: bold **text**, bullet points
    const renderText = (text) => {
        return text.split('\n').map((line, i) => {
            const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
            if (isBullet) {
                return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bold.replace(/^[\*\-]\s/, '') }} />;
            }
            return <p key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: bold }} />;
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 soft-shadow overflow-hidden">

            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">AI Nutrition Coach</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gemini Secure Backend</span>
                        </div>
                    </div>
                </div>
                <button onClick={clearChat} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Clear chat">
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={msg.id} className={clsx('flex gap-3', isUser ? 'ml-auto flex-row-reverse max-w-[80%]' : 'max-w-[85%]')}>
                            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                                isUser ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400')}>
                                {isUser ? <User size={15} /> : <Bot size={15} />}
                            </div>
                            <div className={clsx('px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm space-y-1',
                                isUser ? 'bg-slate-800 dark:bg-slate-700 text-white rounded-tr-sm' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm')}>
                                {renderText(msg.text)}
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                            <Bot size={15} />
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]"></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => sendMessage(p)} disabled={isTyping}
                        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50">
                        {p}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)}
                        placeholder="Ask about calories, recipes, or health tips..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-slate-200 dark:placeholder-slate-500 text-sm" />
                    <button type="submit" disabled={!input.trim() || isTyping}
                        className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send size={16} />
                    </button>
                </form>
                <div className="flex items-center gap-2 mt-2 px-1">
                    <Sparkles size={11} className="text-emerald-500" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Powered by Google Gemini</p>
                </div>
            </div>
        </div>
    );
}