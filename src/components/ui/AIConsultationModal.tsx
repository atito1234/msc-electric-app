import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User, Clock, FileText, MessageSquare, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { db } from '@/lib/supabase-database';

interface AIConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    context: {
        type: string; // 'heavy-up', 'smart-panel', etc.
        title: string;
    } | null;
}

interface Message {
    id: string;
    sender: 'bot' | 'user';
    content: React.ReactNode;
    type: 'text' | 'options' | 'calendar' | 'input';
    options?: string[];
}

const SCRIPTS: Record<string, { intro: string[], questions: string[] }> = {
    'heavy-up': {
        intro: [
            "I see you're interested in a 200 Amp Heavy-Up. That's a smart move for modernizing your home.",
            "To give you the best advice, I need to understand your current setup."
        ],
        questions: [
            "Do you currently experience flickering lights or breaker trips?",
            "Are you planning to add an EV charger or solar panels soon?",
            "Is your current panel inside the house or outside?"
        ]
    },
    'smart-panel': {
        intro: [
            "The Smart Panel is a game-changer for energy management.",
            "Let's make sure it fits your goals."
        ],
        questions: [
            "Are you looking to monitor energy usage or control circuits remotely?",
            "Do you have a backup battery or generator?",
            "How many critical circuits do you need to back up?"
        ]
    },
    'surge-protection': {
        intro: [
            "Whole-home surge protection is the best insurance for your electronics.",
            "It installs right at your main panel."
        ],
        questions: [
            "Have you lost equipment to power surges before?",
            "Do you have high-value electronics or HVAC equipment you're worried about?"
        ]
    },
    default: {
        intro: [
            "I'd be happy to help you with your electrical project.",
            "To give you the best advice, I need to know a bit more about your situation."
        ],
        questions: [
            "First, could you tell me a bit about the issue you're facing or the project you have in mind?",
            "Thanks. Approximately how old is the property?",
            "Have you noticed any specific symptoms like flickering lights, buzzing sounds, or warm outlets?"
        ]
    }
};

export function AIConsultationModal({ isOpen, onClose, context }: AIConsultationModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [step, setStep] = useState(0);
    const [mode, setMode] = useState<'selection' | 'chat' | 'details' | 'success'>('selection');
    const bottomRef = useRef<HTMLDivElement>(null);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [bookingDetails, setBookingDetails] = useState<{ date: Date | null, time: string | null, type: 'virtual' | 'in-person' }>({ date: null, time: null, type: 'in-person' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Greeting & Reset
    useEffect(() => {
        if (isOpen && context) {
            setMessages([]); // Clear previous chat
            setStep(0);
            setBookingDetails({ date: null, time: null, type: 'in-person' });
            setFormData({ name: '', email: '', phone: '', address: '' });

            if (context.type === 'chat') {
                setMode('chat');
                // Auto-start chat
                const script = SCRIPTS['default'];
                setMessages([
                    { id: '1', sender: 'bot', type: 'text', content: "Hi! I'm MSC Agent, your AI electrical consultant." }
                ]);
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: '2', sender: 'bot', type: 'text', content: script.intro[0] }]);
                }, 800);
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: '3', sender: 'bot', type: 'text', content: script.intro[1] }]);
                }, 1600);
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: '4', sender: 'bot', type: 'text', content: script.questions[0] }]);
                    setStep(1);
                }, 2400);

            } else if (context.type === 'quote') {
                setMode('details');
            } else {
                setMode('selection');
            }
        }
    }, [isOpen, context]);

    const addMessage = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
    };

    const startChat = () => {
        setMode('chat');
        const script = SCRIPTS[context?.type || 'default'] || SCRIPTS['default'];

        // Staggered Intro
        addMessage({ id: '1', sender: 'bot', type: 'text', content: "Hi! I'm MSC Agent, your AI electrical consultant." });

        setTimeout(() => {
            addMessage({ id: '2', sender: 'bot', type: 'text', content: script.intro[0] });
        }, 800);

        setTimeout(() => {
            addMessage({ id: '3', sender: 'bot', type: 'text', content: script.intro[1] });
        }, 1600);

        setTimeout(() => {
            // Start questions
            addMessage({
                id: '4',
                sender: 'bot',
                type: 'text',
                content: script.questions[0]
            });
            setStep(1);
        }, 2400);
    };

    const handleQuickForm = () => {
        setMode('details');
    };

    const handleOptionSelect = (option: string) => {
        // User Selected an Option
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', type: 'text', content: option };
        setMessages(prev => [...prev, userMsg]);

        if (option.includes('Virtual')) {
            setBookingDetails(prev => ({ ...prev, type: 'virtual' }));
            setTimeout(() => {
                setMessages(prev => [...prev,
                { id: Date.now() + 'c', sender: 'bot', type: 'text', content: "Great. A dedicated 15-minute virtual session to clarify your needs." },
                { id: Date.now() + 'd', sender: 'bot', type: 'calendar', content: "Select a time for your call:" }
                ]);
            }, 800);
        } else {
            setBookingDetails(prev => ({ ...prev, type: 'in-person' }));
            setTimeout(() => {
                setMessages(prev => [...prev,
                { id: Date.now() + 'c', sender: 'bot', type: 'text', content: "Excellent. Our Master Electrician will perform a comprehensive safety inspection." },
                { id: Date.now() + 'd', sender: 'bot', type: 'calendar', content: "Select a time for your visit:" }
                ]);
            }, 800);
        }
    };

    const handleTimeSelect = (time: string) => {
        if (!selectedDate) return;

        setBookingDetails(prev => ({ ...prev, date: selectedDate, time }));

        setMessages(prev => [...prev,
        { id: Date.now().toString(), sender: 'user', type: 'text', content: `I'd like to book for ${time}.` },
        { id: Date.now() + 'b', sender: 'bot', type: 'text', content: "Perfect. I've tentatively held that slot for you." },
        { id: Date.now() + 'f', sender: 'bot', type: 'text', content: "Please provide your contact details to confirm." }
        ]);

        setTimeout(() => {
            setMode('details');
        }, 1500);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Analyze Complexity
            const userText = messages
                .filter(m => m.sender === 'user' && typeof m.content === 'string')
                .map(m => (m.content as string).toLowerCase())
                .join(' ');
            const simpleKeywords = ['outlet', 'switch', 'light', 'fixture', 'fan', 'dimmer', 'plug', 'small', 'replace', 'simple', 'repair'];
            const complexity = simpleKeywords.some(k => userText.includes(k)) ? 'simple' : 'complex';

            // Chat Summary
            const description = messages
                .map(m => `${m.sender.toUpperCase()}: ${typeof m.content === 'string' ? m.content : '[Interactive Component]'}`)
                .join('\n');

            await db.saveLead({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                serviceType: `${context?.type || 'General'} - ${bookingDetails.type}`,
                complexity,
                description,
                preferredTime: bookingDetails.date ? `${format(bookingDetails.date, 'yyyy-MM-dd')} ${bookingDetails.time}` : undefined,
                status: 'new'
            });

            setIsSubmitting(false);
            setMode('success');
        } catch (error) {
            console.error('Error saving lead:', error);
            setIsSubmitting(false);
            alert("There was a problem submitting your request. Please try again.");
        }
    };

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // User Message
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', type: 'text', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Bot Response Logic (Mock AI)
        setTimeout(() => {
            const script = SCRIPTS[context?.type || 'default'] || SCRIPTS['default'];

            if (step < script.questions.length) {
                // Next Question
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    type: 'text',
                    content: script.questions[step]
                }]);
                setStep(s => s + 1);
            } else if (step === script.questions.length) {
                // Recommendation Logic

                if (context?.type === 'default' || context?.type === 'chat' || !context?.type) {
                    // Analyze Complexity
                    const userText = messages
                        .filter(m => m.sender === 'user' && typeof m.content === 'string')
                        .map(m => (m.content as string).toLowerCase())
                        .join(' ');
                    const simpleKeywords = ['outlet', 'switch', 'light', 'fixture', 'fan', 'dimmer', 'plug', 'small', 'replace', 'simple', 'repair'];
                    const isSimple = simpleKeywords.some(k => userText.includes(k));

                    if (isSimple) {
                        setMessages(prev => [...prev,
                        { id: Date.now().toString(), sender: 'bot', type: 'text', content: "Thanks for the details. This sounds like a straightforward task that we can handle quickly." },
                        { id: Date.now() + 'o', sender: 'bot', type: 'text', content: "For smaller projects like this, we can often provide a quote over the phone or email without a diagnostic fee." },
                        {
                            id: Date.now() + 'opt',
                            sender: 'bot',
                            type: 'options',
                            content: null,
                            options: ['Request Free Call (15 min)', 'Book Technician Visit']
                        }
                        ]);
                    } else {
                        // Complex Project -> Standard Diagnostic Flow
                        setMessages(prev => [...prev,
                        { id: Date.now().toString(), sender: 'bot', type: 'text', content: "Thanks for sharing those details. It sounds like a situation that benefits from a professional look." },
                        { id: Date.now() + 'o', sender: 'bot', type: 'text', content: "To move forward, you have two options:" },
                        {
                            id: Date.now() + 'opt',
                            sender: 'bot',
                            type: 'options',
                            content: null,
                            options: ['Virtual Consultation (15 min)', 'In-Person Diagnostic ($350)']
                        }
                        ]);
                    }
                } else {
                    // Specific flow -> Direct Calendar
                    setMessages(prev => [...prev,
                    { id: Date.now().toString(), sender: 'bot', type: 'text', content: "Thanks for those details. Based on your needs, I highly recommend finding a time for our Master Electrician to visit." },
                    { id: Date.now() + 'o', sender: 'bot', type: 'text', content: "We offer a comprehensive Diagnostic Visit for $350. This includes a full safety inspection and a detailed scope of work." },
                    { id: Date.now() + 'p', sender: 'bot', type: 'text', content: "This $350 is **fully refundable** if you proceed with the project." },
                    { id: Date.now() + 'c', sender: 'bot', type: 'calendar', content: "Select a time for your visit:" }
                    ]);
                }
                setStep(s => s + 1);
            }
        }, 800);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 fade-in duration-300"
            >

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1A1D24]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F2C94C]/20 flex items-center justify-center border border-[#F2C94C]/50">
                            <Bot className="w-5 h-5 text-[#F2C94C]" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">MSC Agent</h3>
                            <p className="text-xs text-[#F2C94C]">AI Electrical Consultant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#0B0C0F] relative">

                    {/* SELECTION MODE */}
                    {mode === 'selection' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                                How can we help you today?
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                You can get a quick quote by providing some info, or chat with our AI to diagnose your exact needs.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                                <button
                                    onClick={startChat}
                                    className="group p-6 rounded-2xl bg-[#1A1D24] border border-white/5 hover:border-[#F2C94C] hover:bg-[#F2C94C]/5 transition-all flex flex-col items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#F2C94C]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-8 h-8 text-[#F2C94C]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">Consult w/ MSC Agent</h3>
                                        <p className="text-sm text-gray-500">Guided diagnostics & advice</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleQuickForm}
                                    className="group p-6 rounded-2xl bg-[#1A1D24] border border-white/5 hover:border-blue-500 hover:bg-blue-500/5 transition-all flex flex-col items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">Quick Quote</h3>
                                        <p className="text-sm text-gray-500">Skip to basic details form</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CHAT MODE */}
                    {mode === 'chat' && (
                        <div className="p-6 space-y-6 min-h-full">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>

                                    {msg.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-[#F2C94C]/10 flex-shrink-0 mr-3 flex items-center justify-center mt-1">
                                            <Bot className="w-4 h-4 text-[#F2C94C]" />
                                        </div>
                                    )}

                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                                        ? 'bg-[#F2C94C] text-black rounded-tr-none'
                                        : 'bg-[#1A1D24] text-gray-200 border border-white/5 rounded-tl-none'
                                        }`}>
                                        {msg.type === 'calendar' ? (
                                            <div className="w-full">
                                                <p className="mb-4 text-sm text-gray-400">Select a date & time (CST):</p>
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    {[1, 2, 3].map(d => {
                                                        const date = addDays(new Date(), d);
                                                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                                                        return (
                                                            <button
                                                                key={d}
                                                                onClick={() => setSelectedDate(date)}
                                                                className={`p-2 rounded-lg text-center text-sm transition-all border ${isSelected
                                                                    ? 'bg-[#F2C94C] text-black border-[#F2C94C]'
                                                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                <span className="block text-xs opacity-60">{format(date, 'MMM')}</span>
                                                                <span className="font-bold">{format(date, 'd')}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {selectedDate && (
                                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                        {['09:00 AM', '01:00 PM', '03:30 PM'].map(time => (
                                                            <button
                                                                key={time}
                                                                onClick={() => handleTimeSelect(time)}
                                                                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#F2C94C]/50 hover:bg-[#F2C94C]/10 transition-all group"
                                                            >
                                                                <span className="text-sm font-mono text-gray-300 group-hover:text-[#F2C94C]">{time}</span>
                                                                <Clock className="w-4 h-4 text-gray-500 group-hover:text-[#F2C94C]" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : msg.type === 'options' ? (
                                            <div className="flex flex-col gap-2">
                                                {msg.options?.map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleOptionSelect(opt)}
                                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#F2C94C] hover:text-black hover:border-transparent transition-all text-sm font-bold text-left"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                        )}
                                    </div>

                                    {msg.sender === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 ml-3 flex items-center justify-center mt-1">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    )}

                    {/* DETAILS FORM MODE */}
                    {mode === 'details' && (
                        <div className="p-8 h-full flex flex-col animate-fade-in">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Final Step!</h2>
                                <p className="text-gray-400">
                                    {bookingDetails.time
                                        ? `Complete your booking for ${format(bookingDetails.date!, 'MMM d')} at ${bookingDetails.time}.`
                                        : "Please provide your details so we can send you a quote."}
                                </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md mx-auto w-full">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1A1D24] border border-white/10 rounded-lg p-3 text-white focus:border-[#F2C94C] focus:outline-none transition-colors"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#1A1D24] border border-white/10 rounded-lg p-3 text-white focus:border-[#F2C94C] focus:outline-none transition-colors"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-[#1A1D24] border border-white/10 rounded-lg p-3 text-white focus:border-[#F2C94C] focus:outline-none transition-colors"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Service Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1A1D24] border border-white/10 rounded-lg p-3 text-white focus:border-[#F2C94C] focus:outline-none transition-colors"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="123 Main St, Springfield"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 mt-6 bg-[#F2C94C] text-black font-bold rounded-xl hover:bg-[#F5D76E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {bookingDetails.time ? 'Confirm Booking' : 'Get Quote'}
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* SUCCESS MODE */}
                    {mode === 'success' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-[#0B0C0F]">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-white mb-4">
                                You're All Set!
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                                Thank you, <span className="text-white font-bold">{formData.name}</span>.
                                {bookingDetails.time
                                    ? " We've received your booking request. Check your email for confirmation."
                                    : " We've received your details. One of our experts will reach out to you shortly."}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white"
                            >
                                Close Window
                            </button>
                        </div>
                    )}
                </div>

                {/* Input Area (Only in Chat Mode) */}
                {mode === 'chat' && (
                    <div className="p-4 bg-[#1A1D24] border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your answer or question..."
                                className="flex-1 bg-[#0B0C0F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F2C94C] transition-colors"
                            />
                            <button
                                onClick={handleSend}
                                className="p-3 rounded-lg bg-[#F2C94C] text-black hover:bg-[#F5D76E] transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
