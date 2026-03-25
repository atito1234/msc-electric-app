import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, Phone, MapPin, Clock, FileText, CheckCircle, ArrowRight, User as UserIcon, FileSignature, MessageSquare, CheckCircle2, Package, Play } from 'lucide-react';
import { db } from '@/lib/supabase-database';
import type { Lead, LeadStatus } from '@/lib/database';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClientJourneyTracker } from '@/components/ui/ClientJourneyTracker';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ElementType }> = {
    new: { label: 'New', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
    contacted: { label: 'Contacted', color: 'bg-[#F2C94C]/20 text-[#F2C94C]', icon: Phone },
    communicated: { label: 'Communicated', color: 'bg-[#F2C94C]/20 text-[#F2C94C]', icon: MessageSquare },
    quote_prepared: { label: 'Quote Prepared', color: 'bg-purple-500/20 text-purple-400', icon: FileSignature },
    quote_accepted: { label: 'Quote Accepted', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    contract_prepared: { label: 'Contract Prepared', color: 'bg-purple-500/20 text-purple-400', icon: FileSignature },
    contract_accepted: { label: 'Contract Accepted', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    contracted: { label: 'Contracted', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    scheduled: { label: 'Scheduled', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
    archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-400', icon: FileText },
};

export function AdminLeads() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
    const queryClient = useQueryClient();

    const { data: leads = [], isLoading } = useQuery<Lead[]>({
        queryKey: ['admin-leads'],
        queryFn: db.getLeads,
        refetchInterval: 5000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => db.updateLeadStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            toast.success('Lead status updated');
        },
        onError: () => {
            toast.error('Failed to update lead status');
        }
    });

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
        updateStatusMutation.mutate({ id: leadId, status: newStatus });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#F2C94C] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">Lead Management</h2>
                    <p className="text-[#A9AFB8]">Manage incoming AI consultation requests and project inquiries</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
                    <input
                        type="text"
                        placeholder="Search leads by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C]"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] [&>option]:bg-[#111318] focus:outline-none focus:border-[#F2C94C]"
                >
                    <option value="all">All Status</option>
                    {Object.entries(statusConfig).map(([status, config]) => (
                        <option key={status} value={status}>{config.label}</option>
                    ))}
                </select>
            </div>

            <div className="w-full">
                {filteredLeads.length === 0 ? (
                    <div className="py-12 text-center text-[#A9AFB8] bg-white/5 rounded-xl border border-white/10">
                        No leads found matching your filters.
                    </div>
                ) : (
                    <Accordion type="multiple" className="w-full space-y-4">
                        {Object.entries(
                            filteredLeads.reduce((acc, lead) => {
                                const email = lead.email || 'unknown';
                                if (!acc[email]) acc[email] = [];
                                acc[email].push(lead);
                                return acc;
                            }, {} as Record<string, Lead[]>)
                        ).map(([email, userLeads]) => {
                            const firstUser = userLeads[0];
                            const activeCount = userLeads.filter(l => l.status !== 'archived').length;

                            return (
                                <AccordionItem key={email} value={email} className="border border-white/10 rounded-xl bg-[#1a1d24] px-4">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-[#F2C94C]" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-display font-semibold text-lg text-[#F6F7F9]">
                                                        {firstUser.name || 'Unknown User'}
                                                    </h3>
                                                    <p className="text-[#6A6D75] text-sm truncate max-w-[200px] md:max-w-md">{email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="hidden md:flex items-center gap-2 text-xs text-[#A9AFB8]">
                                                    <Mail className="w-3 h-3" /> {userLeads.length} Total Request(s)
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${activeCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {activeCount} Active
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-6 space-y-6">
                                        {userLeads.map((lead) => (
                                            <div key={lead.id} className="relative">
                                                {/* Only display admin journey tracker, no extra wrapper card needed since it has its own styling */}
                                                <ClientJourneyTracker
                                                    lead={lead}
                                                    isAdmin={true}
                                                    onUpdateStatus={(status, type, progress) => {
                                                        if (type === 'lead') {
                                                            handleStatusChange(lead.id!, status as LeadStatus);
                                                        } else {
                                                            toast.info("Project progression should be mapped from Project Dashboard.");
                                                        }
                                                    }}
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="absolute top-6 right-6 z-20 text-xs font-mono tracking-widest text-[#F2C94C] uppercase hover:underline flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-md backdrop-blur-sm border border-white/5">
                                                            Manual Override <ArrowRight className="w-3 h-3" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-[#111318] border-white/10">
                                                        {Object.entries(statusConfig).map(([status, config]) => (
                                                            <DropdownMenuItem
                                                                key={status}
                                                                className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer text-xs"
                                                                onClick={() => handleStatusChange(lead.id!, status as LeadStatus)}
                                                            >
                                                                Mark as {config.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
