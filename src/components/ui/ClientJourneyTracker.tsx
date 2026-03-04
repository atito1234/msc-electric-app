
import {
    CheckCircle2,
    Circle,
    Clock,
    FileSignature,
    MessageSquare,
    Package,
    Play,
    Send
} from 'lucide-react';
import type { Lead, Project } from '@/lib/database';

interface ClientJourneyTrackerProps {
    lead: Lead;
    project?: Project;
    isAdmin?: boolean;
    onUpdateStatus?: (status: string, milestoneType: 'lead' | 'project', requiredProgress?: number) => void;
}

const MILESTONES = [
    { id: 'submitted', label: 'Submitted', type: 'lead', requiredStatus: 'new', icon: Send },
    { id: 'communicated', label: 'Communicated', type: 'lead', requiredStatus: 'contacted', icon: MessageSquare },
    { id: 'quote_prepared', label: 'Quote Prepared', type: 'lead', requiredStatus: 'quote_prepared', icon: FileSignature },
    { id: 'quote_accepted', label: 'Quote Accepted', type: 'lead', requiredStatus: 'quote_accepted', icon: CheckCircle2 },
    { id: 'contract_prepared', label: 'Contract Prepared', type: 'lead', requiredStatus: 'contract_prepared', icon: FileSignature },
    { id: 'contract_accepted', label: 'Contract Accepted', type: 'lead', requiredStatus: 'contract_accepted', icon: CheckCircle2 },
    { id: 'job_started', label: 'Job Started', type: 'project', requiredProgress: 0, icon: Play },
    { id: 'job_30', label: 'Job 30%', type: 'project', requiredProgress: 30, icon: Clock },
    { id: 'job_50', label: 'Job 50%', type: 'project', requiredProgress: 50, icon: Package },
    { id: 'job_70', label: 'Job 70%', type: 'project', requiredProgress: 70, icon: Clock },
    { id: 'job_90', label: 'Job 90%', type: 'project', requiredProgress: 90, icon: Clock },
    { id: 'job_completed', label: 'Job Completed!', type: 'project', requiredProgress: 100, icon: CheckCircle2 },
];

export function ClientJourneyTracker({ lead, project, isAdmin, onUpdateStatus }: ClientJourneyTrackerProps) {
    // Determine current step index based on lead status and project progress
    let currentStepIndex = 0;

    // 1. Lead Progress Logic
    const leadStatuses = ['new', 'contacted', 'quote_prepared', 'quote_accepted', 'contract_prepared', 'contract_accepted', 'contracted'];
    const leadIndex = leadStatuses.indexOf(lead.status);

    if (leadIndex >= 0) {
        if (leadIndex >= 1) currentStepIndex = 1; // communicated
        if (leadIndex >= 2) currentStepIndex = 2; // quote_prepared
        if (leadIndex >= 3) currentStepIndex = 3; // quote_accepted
        if (leadIndex >= 4) currentStepIndex = 4; // contract_prepared
        if (leadIndex >= 5) currentStepIndex = 5; // contract_accepted
    }

    // 2. Project Progress Logic
    if (project || leadIndex >= 5 || lead.status === 'contracted') {
        currentStepIndex = 5; // Ensure at least contract accepted

        if (project) {
            currentStepIndex = 6; // Job Started
            if (project.progress >= 30) currentStepIndex = 7;
            if (project.progress >= 50) currentStepIndex = 8;
            if (project.progress >= 70) currentStepIndex = 9;
            if (project.progress >= 90) currentStepIndex = 10;
            if (project.progress >= 100 || project.status === 'completed') currentStepIndex = 11;
        }
    }

    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
            {/* Background glow effects for active progress */}
            <div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-500/80 to-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-in-out"
                style={{ width: `${(currentStepIndex / (MILESTONES.length - 1)) * 100}%` }}
            />

            <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-start relative">
                <div className="md:w-1/3">
                    <h3 className="text-xl font-bold text-white mb-2">{lead.serviceType || 'General Request'}</h3>
                    <p className="text-zinc-400 text-sm mb-4">Submitted: {new Date(lead.createdAt).toLocaleDateString()}</p>

                    <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                        <p className="text-zinc-300 text-sm italic">"{lead.description}"</p>
                    </div>
                </div>

                <div className="md:w-2/3 relative pt-4">
                    {/* Connecting Line background */}
                    <div className="absolute top-10 left-4 right-4 h-1 bg-zinc-800 rounded-full hidden md:block" />

                    {/* Active Connecting Line */}
                    <div
                        className="absolute top-10 left-4 h-1 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full hidden md:block shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-all duration-1000"
                        style={{ width: `calc(${(currentStepIndex / (MILESTONES.length - 1)) * 100}% - 2rem)` }}
                    />

                    <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-0">
                        {MILESTONES.map((milestone, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isActive = idx === currentStepIndex;
                            const isFuture = idx > currentStepIndex;

                            return (
                                <div
                                    key={milestone.id}
                                    className={`flex md:flex-col items-center gap-4 md:gap-3 z-10 group ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                    onClick={() => {
                                        if (isAdmin && onUpdateStatus) {
                                            onUpdateStatus(milestone.requiredStatus as string, milestone.type as 'lead' | 'project', milestone.requiredProgress);
                                        }
                                    }}
                                >
                                    {/* Visual Node */}
                                    <div className="relative">
                                        <div
                                            style={{
                                                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                                                backgroundColor: isCompleted ? '#f59e0b' : '#27272a',
                                                borderColor: isActive ? '#fcd34d' : isCompleted ? '#f59e0b' : '#3f3f46',
                                                boxShadow: isActive ? '0 0 20px rgba(245, 158, 11, 0.4)' : 'none'
                                            }}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500`}
                                        >
                                            {isCompleted ? (
                                                <milestone.icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-900'}`} />
                                            ) : (
                                                <Circle className="w-4 h-4 text-zinc-600" />
                                            )}
                                        </div>

                                        {/* Pulse ring for active step */}
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
                                        )}
                                    </div>

                                    {/* Text Label */}
                                    <div className="flex-1 md:text-center">
                                        <p className={`text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${isCompleted ? 'text-white' : 'text-zinc-500'} ${isActive && 'text-amber-400'}`}>
                                            {milestone.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
