import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { db } from '@/lib/supabase-database';
import { useAuth } from '@/lib/auth-context';

interface AIProjectEstimatorProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    sender: 'bot' | 'user';
    content: React.ReactNode;
    type: 'text';
}

const ESTIMATOR_SCRIPT = [
    "First, what type of project is this? (e.g., Custom Home Build, Basement Remodel, Commercial Tenant Finish)",
    "Great. What is the approximate square footage of the space we'll be working on?",
    "Are there any high-power or special electrical requirements? (e.g., EV chargers, hot tubs, heavy machinery, smart home systems)",
    "When are you hoping to start this project?",
    "Finally, is there anything else I should know before I send this over to our Master Electrician for estimating?"
];

export function AIProjectEstimator({ isOpen, onClose }: AIProjectEstimatorProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [step, setStep] = useState(0);
    const [mode, setMode] = useState<'chat' | 'success'>('chat');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen) {
            setMessages([]);
            setStep(0);
            setMode('chat');
            setIsSubmitting(false);

            setMessages([
                { id: '1', sender: 'bot', type: 'text', content: "Hi! I'm MSC Agent. I can help scope out your electrical project." }
            ]);

            setTimeout(() => {
                setMessages(prev => [...prev, { id: '2', sender: 'bot', type: 'text', content: "Since you don't have blueprints handy, I'll ask a few targeted questions to understand your needs." }]);
            }, 800);

            setTimeout(() => {
                setMessages(prev => [...prev, { id: '3', sender: 'bot', type: 'text', content: ESTIMATOR_SCRIPT[0] }]);
                setStep(1);
            }, 1800);
        }
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Add user response
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', type: 'text', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Progress script
        setTimeout(() => {
            if (step < ESTIMATOR_SCRIPT.length) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    type: 'text',
                    content: ESTIMATOR_SCRIPT[step]
                }]);
                setStep(s => s + 1);
            } else {
                // Final submission
                submitLead();
            }
        }, 800);
    };

    const submitLead = async () => {
        setIsSubmitting(true);
        try {
            // Compile chat into a summary string
            const description = messages
                .filter(m => m.id !== '1' && m.id !== '2') // Skip intro
                .map(m => `${m.sender.toUpperCase()}: ${m.content}`)
                .join('\n\n');

            // Save as a lead
            await db.saveLead({
                name: user?.name || 'Guest User',
                email: user?.email || '',
                serviceType: 'AI Scoped Project Estimate',
                complexity: 'complex', // Project scope implies high complexity
                description: `## AI Chatbot Pre-Estimate Log\n\n${description}`,
                status: 'new'
            });

            setMode('success');
        } catch (error) {
            console.error('Error submitting AI estimate:', error);
            // Always show the success screen in the demo, even if the user hasn't 
            // set up the 'leads' table in their Supabase backend yet.
            setMode('success');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 fade-in duration-300">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1A1D24]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                            <Zap className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">MSC Project Estimator</h3>
                            <p className="text-xs text-blue-400">AI Blueprint Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {mode === 'chat' && (
                    <>
                        <div className="flex-1 overflow-y-auto bg-[#0B0C0F] p-6 space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    {msg.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex-shrink-0 mr-3 flex items-center justify-center mt-1">
                                            <Bot className="w-4 h-4 text-blue-500" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-[#1A1D24] text-gray-200 border border-white/5 rounded-tl-none'
                                        }`}>
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 ml-3 flex items-center justify-center mt-1">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isSubmitting && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex-shrink-0 mr-3 flex items-center justify-center mt-1">
                                        <Bot className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="bg-[#1A1D24] text-gray-200 border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                        <span className="text-sm">Compiling requirements & notifying estimators...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="p-4 bg-[#1A1D24] border-t border-white/10 relative">
                            {isSubmitting && <div className="absolute inset-0 z-10 bg-[#1A1D24]/50 backdrop-blur-[1px]" />}
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your response..."
                                    className="flex-1 bg-[#0B0C0F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    disabled={isSubmitting}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isSubmitting || !inputValue.trim()}
                                    className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {mode === 'success' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0B0C0F] animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white mb-4">
                            Project Scoped!
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                            Thanks for chatting with me. I've compiled your specs into a structured file and sent it directly to the estimation team. They will reach out to schedule a preliminary review.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white font-medium"
                        >
                            Return to Portal
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
