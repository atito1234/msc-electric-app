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
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                >
                    <option value="all">All Status</option>
                    {Object.entries(statusConfig).map(([status, config]) => (
                        <option key={status} value={status}>{config.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLeads.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-[#A9AFB8] bg-white/5 rounded-xl border border-white/10">
                        No leads found matching your filters.
                    </div>
                ) : (
                    filteredLeads.map((lead) => {
                        const StatusIcon = statusConfig[lead.status as LeadStatus]?.icon || Clock;
                        const statusColor = statusConfig[lead.status as LeadStatus]?.color || 'bg-gray-500/20 text-gray-400';
                        const statusLabel = statusConfig[lead.status as LeadStatus]?.label || 'Unknown';

                        return (
                            <div key={lead.id} className="glass-card rounded-xl border border-white/10 p-6 flex flex-col hover:border-[#F2C94C]/30 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusColor}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {statusLabel}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-xs font-mono tracking-widest text-[#F2C94C] uppercase hover:underline flex items-center gap-1">
                                                Update <ArrowRight className="w-3 h-3" />
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

                                <div className="mb-4 text-left">
                                    <h3 className="font-display font-semibold text-xl text-[#F6F7F9] flex items-center gap-2">
                                        <UserIcon className="w-5 h-5 text-[#A9AFB8]" />
                                        {lead.name}
                                    </h3>
                                    <p className="text-[#6A6D75] text-xs font-mono mt-1">
                                        {new Date(lead.createdAt || '').toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {lead.email && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-3 h-3 text-[#A9AFB8]" />
                                            </div>
                                            <a href={`mailto:${lead.email}`} className="text-[#F6F7F9] hover:text-[#F2C94C] transition-colors truncate">
                                                {lead.email}
                                            </a>
                                        </div>
                                    )}
                                    {lead.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <Phone className="w-3 h-3 text-[#A9AFB8]" />
                                            </div>
                                            <a href={`tel:${lead.phone}`} className="text-[#F6F7F9] hover:text-[#F2C94C] transition-colors">
                                                {lead.phone}
                                            </a>
                                        </div>
                                    )}
                                    {lead.address && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-3 h-3 text-[#A9AFB8]" />
                                            </div>
                                            <span className="text-[#F6F7F9] truncate">{lead.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto border-t border-white/10 pt-4">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-[#6A6D75] text-[10px] uppercase tracking-wider mb-1">Service</p>
                                            <p className="text-[#F6F7F9] text-sm font-medium">{lead.serviceType || 'General'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[#6A6D75] text-[10px] uppercase tracking-wider mb-1">Complexity</p>
                                            <p className="text-[#F6F7F9] text-sm capitalize font-medium">{lead.complexity || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    {lead.preferredTime && (
                                        <div className="mb-4">
                                            <p className="text-[#6A6D75] text-[10px] uppercase tracking-wider mb-1">Requested Time</p>
                                            <p className="text-[#F2C94C] text-sm font-medium">{lead.preferredTime}</p>
                                        </div>
                                    )}

                                    <div className="bg-black/30 rounded-lg p-3 text-xs text-[#A9AFB8] leading-relaxed max-h-24 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                        {lead.description || 'No description provided.'}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
