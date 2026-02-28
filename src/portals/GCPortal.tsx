import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Project, Contract } from '@/lib/database';
import { db } from '@/lib/supabase-database';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    MessageSquare,
    LogOut,
    MapPin,
    Calendar,
    DollarSign,
    CheckCircle,
    FileUp,
    HardHat,
    ChevronRight,
    UploadCloud,
    Loader2
} from 'lucide-react';

export function GCPortal() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showProjectDialog, setShowProjectDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    // Fetch GC's associated projects (represented locally as client projects for now)
    const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
        queryKey: ['gc-projects', user?.id],
        queryFn: () => user ? db.getProjectsByClient(user.id) : Promise.resolve([]),
        enabled: !!user,
    });

    const isLoading = isLoadingProjects;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'lead': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
            'quoted': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            'contracted': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
            'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
            'inspection': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
            'completed': 'bg-green-500/20 text-green-400 border-green-500/50',
        };
        return colors[status] || 'bg-zinc-500/20 text-zinc-400';
    };

    const handleUploadRFP = () => {
        toast.success('RFP and Blueprints uploaded successfully! We will review and provide a quote shortly.');
        setShowUploadDialog(false);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'My Hub', icon: FolderKanban },
        { id: 'quotes', label: 'Open Quotes', icon: FileText },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-[#0B0C0F] flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111318] border-r border-white/10 flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F2C94C] rounded-lg flex items-center justify-center">
                            <HardHat className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold tracking-tight">MSC Electric</h1>
                            <p className="text-[#F2C94C] text-[10px] uppercase tracking-widest font-bold mt-0.5">GC Partner Hub</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                    ? 'bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/20 font-medium'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/10">
                            {user?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-zinc-500 text-xs truncate">General Contractor</p>
                        </div>
                    </div>
                    <Button
                        onClick={logout}
                        variant="ghost"
                        className="w-full text-zinc-400 hover:bg-red-500/10 hover:text-red-400 justify-start"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                <header className="bg-[#111318]/80 backdrop-blur-md border-b border-white/10 px-8 py-5 sticky top-0 z-10 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        {menuItems.find(m => m.id === activeTab)?.label}
                    </h2>
                    <Button
                        onClick={() => setShowUploadDialog(true)}
                        className="bg-[#F2C94C] hover:bg-[#F5D76E] text-black font-bold h-10"
                    >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Submit New Project
                    </Button>
                </header>

                <div className="p-8 flex-1 overflow-y-auto">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 max-w-6xl mx-auto">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-white mb-2">
                                    Welcome back, {user?.name.split(' ')[0]}
                                </h1>
                                <p className="text-zinc-400">
                                    Track your active jobs, review pending quotes, and manage upcoming developments.
                                </p>
                            </div>

                            {/* Quick Upload CTA */}
                            <div className="glass-card rounded-2xl border border-[#F2C94C]/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:border-[#F2C94C]/50 transition-colors cursor-pointer" onClick={() => setShowUploadDialog(true)}>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F2C94C]/5 to-transparent z-0 pointer-events-none" />
                                <div className="z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-[#F2C94C]/10 flex items-center justify-center border border-[#F2C94C]/30 group-hover:scale-105 transition-transform">
                                        <FileUp className="w-8 h-8 text-[#F2C94C]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Upload Blueprints & Docs</h3>
                                        <p className="text-zinc-400 text-sm">Drop your RFPs, architectural PDFs, and load schedules here for swift AI-assisted estimating.</p>
                                    </div>
                                </div>
                                <div className="z-10 shrink-0">
                                    <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                                        Browse Files
                                    </Button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-[#111318] border-white/10">
                                    <CardContent className="p-6">
                                        <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-mono">Active Jobs</p>
                                        <p className="text-3xl font-display font-bold text-white">{projects.filter(p => ['in-progress', 'contracted', 'inspection'].includes(p.status)).length}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-[#111318] border-white/10">
                                    <CardContent className="p-6">
                                        <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-mono">Pending Quotes</p>
                                        <p className="text-3xl font-display font-bold text-white">{projects.filter(p => ['lead', 'quoted'].includes(p.status)).length}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-[#111318] border-white/10">
                                    <CardContent className="p-6">
                                        <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-mono">Completed Projects</p>
                                        <p className="text-3xl font-display font-bold text-white">{projects.filter(p => p.status === 'completed').length}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Active Projects List */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-white">Active Developments</h3>
                                    <Button variant="ghost" className="text-[#F2C94C] hover:text-[#F2C94C] hover:bg-[#F2C94C]/10" onClick={() => setActiveTab('projects')}>
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                                <div className="grid gap-4">
                                    {projects.filter(p => ['contracted', 'in-progress', 'inspection'].includes(p.status)).map(project => (
                                        <div key={project.id} className="bg-[#111318] border border-white/10 rounded-xl p-5 hover:bg-white/5 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4" onClick={() => { setSelectedProject(project); setShowProjectDialog(true); }}>
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                                    <FolderKanban className="w-6 h-6 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium">{project.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {project.address.city}, {project.address.state}</span>
                                                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Est. {project.estimatedValue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 md:w-64">
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="text-zinc-400">Progress</span>
                                                        <span className="text-white font-mono">{project.progress}%</span>
                                                    </div>
                                                    <Progress value={project.progress} className="h-1.5 bg-white/10" />
                                                </div>
                                                <Badge className={getStatusColor(project.status)}>{project.status.replace('-', ' ')}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {projects.filter(p => ['contracted', 'in-progress', 'inspection'].includes(p.status)).length === 0 && (
                                        <p className="text-zinc-500 p-4 border border-white/5 rounded-xl border-dashed text-center">No active projects found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="space-y-6 max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-6">Development Hub</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {projects.map((project) => (
                                    <Card key={project.id} className="bg-[#111318] border-white/10 hover:border-[#F2C94C]/30 transition-colors cursor-pointer group" onClick={() => { setSelectedProject(project); setShowProjectDialog(true); }}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge className={getStatusColor(project.status)}>{project.status.replace('-', ' ')}</Badge>
                                            </div>
                                            <CardTitle className="text-white text-lg leading-tight group-hover:text-[#F2C94C] transition-colors">{project.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                                <MapPin className="w-3 h-3" /> {project.address.street}, {project.address.city}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Est Completion</p>
                                                        <p className="text-sm text-zinc-300 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{project.estimatedEndDate ? new Date(project.estimatedEndDate).toLocaleDateString() : 'TBD'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Progress</p>
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={project.progress} className="h-2 flex-1 bg-white/10" />
                                                            <span className="text-xs text-white tabular-nums">{project.progress}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['quotes', 'messages'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center h-96 border border-white/5 border-dashed rounded-2xl">
                            <MessageSquare className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-white text-lg font-medium">Coming Soon</h3>
                            <p className="text-zinc-500 text-sm mt-1">This module is actively under development.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="bg-[#111318] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Submit New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-[#F2C94C]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-6 h-6 text-[#F2C94C]" />
                            </div>
                            <p className="text-white font-medium mb-1">Drag & Drop Files Here</p>
                            <p className="text-zinc-500 text-xs">PDF blueprints, RFPs, or spec sheets up to 50MB</p>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-2">Project Name / Reference ID</label>
                            <input type="text" className="w-full bg-[#0B0C0F] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#F2C94C]" placeholder="e.g. Oakwood Residential Phase 2" />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-2">Brief Scope Notes (Optional)</label>
                            <textarea className="w-full bg-[#0B0C0F] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#F2C94C] resize-none h-24" placeholder="Mention any specific electrical requirements or timelines..." />
                        </div>
                        <Button className="w-full bg-[#F2C94C] text-black font-bold hover:bg-[#F5D76E]" onClick={handleUploadRFP}>
                            Submit for Estimating
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
