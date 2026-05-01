import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const INITIAL_MESSAGES = [
    {
        id: 1,
        role: 'system',
        text: "Hi! I'm your personal nutrition assistant. I can help you with meal ideas, calorie tracking, or general wellness advice. What's on your mind?"
    }
];

const Chatbot = () => {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            text: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponses = [
                "That sounds like a great choice! Make sure to balance it with some protein.",
                "Remember to stay hydrated throughout the day!",
                "Based on your goals, you might want to try adding more fiber to that meal.",
                "Great job tracking your intake! Consistency is key.",
                "Have you considered meal prepping for the week? It can save a lot of time and calories.",
                "Calculated! That fits well within your daily limit."
            ];

            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

            const aiMessage = {
                id: Date.now() + 1,
                role: 'system',
                text: randomResponse
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 soft-shadow overflow-hidden transition-all duration-300">

            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">AI Wellness Coach</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div
                            key={msg.id}
                            className={clsx(
                                "flex gap-4 max-w-[80%]",
                                isUser ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                isUser ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                            )}>
                                {isUser ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            <div className={clsx(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                isUser
                                    ? "bg-slate-800 dark:bg-slate-700 text-white rounded-tr-sm"
                                    : "bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex gap-4 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                            <Bot size={16} />
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about calories, recipes, or health tips..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-slate-200 dark:placeholder-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="flex items-center gap-2 mt-2 px-2">
                    <Sparkles size={12} className="text-emerald-500" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Powered Assistant</p>
                </div>
            </div>

        </div>
    );
};

export default Chatbot;
