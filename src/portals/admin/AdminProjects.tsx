import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  PauseCircle,
  FileText,
  Edit,
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react';
import type { Project, ProjectStatus, User } from '@/lib/database';
import { db } from '@/lib/database';
import { estimateCostWithAI } from '@/lib/ai-service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: React.ElementType }> = {
  lead: { label: 'Lead', color: 'bg-gray-500/20 text-gray-400', icon: Clock },
  quoted: { label: 'Quoted', color: 'bg-blue-500/20 text-blue-400', icon: FileText },
  contracted: { label: 'Contracted', color: 'bg-purple-500/20 text-purple-400', icon: CheckCircle },
  'in-progress': { label: 'In Progress', color: 'bg-[#F2C94C]/20 text-[#F2C94C]', icon: Clock },
  inspection: { label: 'Inspection', color: 'bg-orange-500/20 text-orange-400', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: PauseCircle },
};

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<any>(null);

  // New project form state
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    clientId: '',
    status: 'lead',
    priority: 'medium',
    estimatedValue: 0,
    progress: 0,
    assignedElectricians: [],
    assignedSubcontractors: [],
    workOrders: [],
    materials: [],
    timeEntries: [],
    photos: [],
    notes: [],
    invoices: [],
    expenses: [],
    history: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allProjects = db.getProjects();
    setProjects(allProjects);

    const allUsers = db.getUsers();
    setClients(allUsers.filter(u => u.role === 'client'));
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = () => {
    const { id: _, ...projectData } = newProject as Project;
    const project: Project = {
      id: `proj-${Date.now()}`,
      ...projectData,
      address: { street: '', city: '', state: '', zip: '' },
      actualValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveProject(project);
    setProjects([...projects, project]);
    setIsAddDialogOpen(false);
    setNewProject({
      name: '',
      description: '',
      clientId: '',
      status: 'lead',
      priority: 'medium',
      estimatedValue: 0,
      progress: 0,
      assignedElectricians: [],
      assignedSubcontractors: [],
      workOrders: [],
      materials: [],
      timeEntries: [],
      photos: [],
      notes: [],
      invoices: [],
      expenses: [],
      history: [],
    });
    toast.success('Project created successfully');
  };

  const handleDeleteProject = (id: string) => {
    db.deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
    toast.success('Project deleted');
  };

  const handleGenerateAIEstimate = () => {
    if (!newProject.description || !newProject.name) {
      toast.error('Please enter project name and description');
      return;
    }

    const estimate = estimateCostWithAI(
      newProject.description,
      'Residential',
      2500
    );

    setAiEstimate(estimate);
    setNewProject({
      ...newProject,
      estimatedValue: estimate.estimatedCost,
    });
    toast.success('AI estimate generated');
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || clientId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">Projects</h2>
          <p className="text-[#A9AFB8]">Manage all electrical projects and track progress</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#111318] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#F6F7F9] font-display">Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Client</label>
                <select
                  value={newProject.clientId}
                  onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C] resize-none"
                  placeholder="Describe the project scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as ProjectStatus })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  >
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <option key={status} value={status}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-xs text-[#A9AFB8]">Estimated Value</label>
                  <button
                    onClick={handleGenerateAIEstimate}
                    className="text-xs text-[#F2C94C] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate AI Estimate
                  </button>
                </div>
                <input
                  type="number"
                  value={newProject.estimatedValue}
                  onChange={(e) => setNewProject({ ...newProject, estimatedValue: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="0"
                />
                {aiEstimate && (
                  <div className="mt-2 p-3 bg-[#F2C94C]/10 rounded-lg">
                    <p className="text-xs text-[#F2C94C]">AI Estimate: ${aiEstimate.estimatedCost.toLocaleString()}</p>
                    <p className="text-xs text-[#6A6D75] mt-1">{aiEstimate.reasoning}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddProject}
                className="w-full btn-primary py-3 mt-4"
              >
                Create Project
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            <option key={status} value={status}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const StatusIcon = statusConfig[project.status].icon;
          return (
            <div key={project.id} className="glass-card rounded-xl p-5 hover:border-[#F2C94C]/30 transition-all group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig[project.status].color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[project.status].label}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 text-[#6A6D75] hover:text-[#F6F7F9] opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#111318] border-white/10">
                    <DropdownMenuItem
                      className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer"
                      onClick={() => { setSelectedProject(project); setIsViewDialogOpen(true); }}
                    >
                      <Eye className="w-4 h-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <h3 className="font-display font-semibold text-[#F6F7F9] mb-1 truncate">{project.name}</h3>
              <p className="text-[#6A6D75] text-sm mb-4">{getClientName(project.clientId)}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#A9AFB8]">Progress</span>
                  <span className="text-[#F6F7F9]">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F2C94C] rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-[#A9AFB8]">
                  <DollarSign className="w-4 h-4" />
                  <span>${project.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#A9AFB8]">
                  <Calendar className="w-4 h-4" />
                  <span>{project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#A9AFB8]">
                  <Users className="w-4 h-4" />
                  <span>{project.assignedElectricians.length + project.assignedSubcontractors.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Project Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[#111318] border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#F6F7F9] font-display">{selectedProject.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Status & Priority & Progress */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedProject.status].color}`}>
                      {statusConfig[selectedProject.status].label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedProject.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      selectedProject.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        selectedProject.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                      }`}>
                      {selectedProject.priority.charAt(0).toUpperCase() + selectedProject.priority.slice(1)} Priority
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Update Progress Timeline</h4>
                    <div className="flex flex-wrap gap-2">
                      {[0, 30, 50, 70, 90, 100].map(pct => (
                        <button
                          key={pct}
                          onClick={() => {
                            db.saveProject({ ...selectedProject, progress: pct });
                            setSelectedProject({ ...selectedProject, progress: pct });
                            toast.success(`Project progress updated to ${pct}%`);
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedProject.progress === pct
                            ? 'bg-[#F2C94C] text-black shadow-[0_0_10px_rgba(242,201,76,0.3)]'
                            : 'bg-white/5 text-[#A9AFB8] hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-[#F6F7F9]">{selectedProject.description}</p>
                </div>

                {/* Financial */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-[#6A6D75] text-xs mb-1">Estimated Value</p>
                    <p className="text-[#F6F7F9] text-xl font-display font-bold">${selectedProject.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-[#6A6D75] text-xs mb-1">Actual Value</p>
                    <p className="text-[#F6F7F9] text-xl font-display font-bold">${selectedProject.actualValue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Team */}
                <div>
                  <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-3">Assigned Team</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.assignedElectricians.map((empId) => {
                      const emp = db.getUserById(empId);
                      return emp ? (
                        <div key={empId} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                            <span className="text-xs text-[#F2C94C]">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <span className="text-sm text-[#F6F7F9]">{emp.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Work Orders */}
                <div>
                  <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-3">Work Orders ({selectedProject.workOrders.length})</h4>
                  {selectedProject.workOrders.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProject.workOrders.map((wo) => (
                        <div key={wo.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-[#F6F7F9] text-sm">{wo.title}</p>
                            <p className="text-[#6A6D75] text-xs">{wo.estimatedHours}h estimated</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${wo.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            wo.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                            {wo.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#6A6D75] text-sm">No work orders yet</p>
                  )}
                </div>

                {/* Invoices */}
                <div>
                  <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-3">Invoices ({selectedProject.invoices.length})</h4>
                  {selectedProject.invoices.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProject.invoices.map((invId) => {
                        const inv = db.getInvoiceById(invId);
                        return inv ? (
                          <div key={invId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <p className="text-[#F6F7F9] text-sm">{inv.invoiceNumber}</p>
                              <p className="text-[#6A6D75] text-xs">{new Date(inv.issueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#F6F7F9] text-sm">${inv.total.toLocaleString()}</p>
                              <span className={`text-xs ${inv.status === 'paid' ? 'text-green-400' :
                                inv.status === 'overdue' ? 'text-red-400' :
                                  'text-blue-400'
                                }`}>{inv.status}</span>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-[#6A6D75] text-sm">No invoices yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
