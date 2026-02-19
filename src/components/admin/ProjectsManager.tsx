import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Eye,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
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

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  type: string;
  budget: number;
  startDate: string;
  endDate: string;
  workers: number;
  progress: number;
}

const mockProjects: Project[] = [
  { id: 'PRJ-001', name: 'Johnson Residence Panel Upgrade', client: 'Johnson Family', status: 'in-progress', type: 'Panel Upgrade', budget: 8500, startDate: '2024-01-15', endDate: '2024-02-01', workers: 2, progress: 65 },
  { id: 'PRJ-002', name: 'Downtown Plaza Commercial Fit-out', client: 'Downtown Plaza LLC', status: 'in-progress', type: 'Commercial', budget: 45000, startDate: '2024-01-10', endDate: '2024-03-15', workers: 6, progress: 40 },
  { id: 'PRJ-003', name: 'Smith Smart Home Installation', client: 'Smith Residence', status: 'completed', type: 'Smart Home', budget: 12000, startDate: '2023-12-01', endDate: '2024-01-10', workers: 3, progress: 100 },
  { id: 'PRJ-004', name: 'EV Charger Installation', client: 'Maria Garcia', status: 'pending', type: 'EV Charging', budget: 3500, startDate: '2024-02-01', endDate: '2024-02-05', workers: 1, progress: 0 },
  { id: 'PRJ-005', name: 'Restaurant Lighting Redesign', client: 'Bistro 42', status: 'on-hold', type: 'Lighting', budget: 8000, startDate: '2024-01-20', endDate: '2024-02-10', workers: 2, progress: 25 },
  { id: 'PRJ-006', name: 'Office Building Safety Inspection', client: 'TechCorp Inc', status: 'completed', type: 'Safety', budget: 2500, startDate: '2024-01-05', endDate: '2024-01-08', workers: 2, progress: 100 },
];

const statusColors = {
  'pending': 'bg-gray-500/20 text-gray-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  'completed': 'bg-green-500/20 text-green-400',
  'on-hold': 'bg-red-500/20 text-red-400',
};

const statusLabels = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'on-hold': 'On Hold',
};

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    client: '',
    type: '',
    budget: 0,
    startDate: '',
    endDate: '',
    status: 'pending',
    workers: 1,
    progress: 0,
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = () => {
    const { id: _, ...projectData } = newProject as Project;
    const project: Project = {
      id: `PRJ-${String(projects.length + 1).padStart(3, '0')}`,
      ...projectData,
    };
    setProjects([...projects, project]);
    setIsAddDialogOpen(false);
    setNewProject({
      name: '',
      client: '',
      type: '',
      budget: 0,
      startDate: '',
      endDate: '',
      status: 'pending',
      workers: 1,
      progress: 0,
    });
    toast.success('Project created successfully');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast.success('Project deleted successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
          >
            <option value="all" className="bg-[#0B0C0F]">All Status</option>
            <option value="pending" className="bg-[#0B0C0F]">Pending</option>
            <option value="in-progress" className="bg-[#0B0C0F]">In Progress</option>
            <option value="completed" className="bg-[#0B0C0F]">Completed</option>
            <option value="on-hold" className="bg-[#0B0C0F]">On Hold</option>
          </select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#111318] border-white/10 max-w-lg">
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
                <input
                  type="text"
                  value={newProject.client}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Client name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Type</label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  >
                    <option value="" className="bg-[#0B0C0F]">Select type</option>
                    <option value="Panel Upgrade" className="bg-[#0B0C0F]">Panel Upgrade</option>
                    <option value="Lighting" className="bg-[#0B0C0F]">Lighting</option>
                    <option value="Smart Home" className="bg-[#0B0C0F]">Smart Home</option>
                    <option value="EV Charging" className="bg-[#0B0C0F]">EV Charging</option>
                    <option value="Commercial" className="bg-[#0B0C0F]">Commercial</option>
                    <option value="Safety" className="bg-[#0B0C0F]">Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Budget</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">End Date</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  />
                </div>
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

      {/* Projects Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Project</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Budget</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Progress</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Workers</th>
                <th className="text-right px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[#F6F7F9] font-medium text-sm">{project.name}</p>
                      <p className="text-[#6A6D75] text-xs font-mono">{project.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#A9AFB8] text-sm">{project.client}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {project.status === 'in-progress' && <Clock className="w-3 h-3" />}
                      {project.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {project.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                      {project.status === 'on-hold' && <AlertCircle className="w-3 h-3" />}
                      {statusLabels[project.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#F6F7F9] text-sm">${project.budget.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#F2C94C] rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-[#A9AFB8] text-xs">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#6A6D75]" />
                      <span className="text-[#A9AFB8] text-sm">{project.workers}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-[#6A6D75] hover:text-[#F6F7F9] transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#111318] border-white/10">
                        <DropdownMenuItem className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
