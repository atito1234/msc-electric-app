import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  User,
  Star,
  Globe
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

interface Worker {
  id: string;
  name: string;
  role: string;
  type: 'employee' | 'subcontractor';
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive' | 'on-leave';
  rating: number;
  projectsCompleted: number;
  currentProject?: string;
  hourlyRate?: number;
  specialties: string[];
}

const mockWorkers: Worker[] = [
  { id: 'WRK-001', name: 'Carlos Martinez', role: 'Master Electrician', type: 'employee', email: 'carlos@mscelectric.com', phone: '(555) 123-4567', location: 'Local', status: 'active', rating: 4.9, projectsCompleted: 145, currentProject: 'Johnson Residence Panel Upgrade', hourlyRate: 85, specialties: ['Panel Upgrades', 'Commercial', 'Troubleshooting'] },
  { id: 'WRK-002', name: 'Maria Garcia', role: 'Journeyman Electrician', type: 'employee', email: 'maria@mscelectric.com', phone: '(555) 234-5678', location: 'Local', status: 'active', rating: 4.8, projectsCompleted: 89, currentProject: 'EV Charger Installation', hourlyRate: 65, specialties: ['Residential', 'EV Charging', 'Smart Home'] },
  { id: 'WRK-003', name: 'Juan Rodriguez', role: 'Electrical Contractor', type: 'subcontractor', email: 'juan@jrelectric.com', phone: '(555) 345-6789', location: 'Remote - Texas', status: 'active', rating: 4.7, projectsCompleted: 203, hourlyRate: 75, specialties: ['Commercial', 'Industrial', 'New Construction'] },
  { id: 'WRK-004', name: 'Ana Lopez', role: 'Lighting Specialist', type: 'subcontractor', email: 'ana@lopezlighting.com', phone: '(555) 456-7890', location: 'Remote - Florida', status: 'active', rating: 4.9, projectsCompleted: 67, hourlyRate: 70, specialties: ['Lighting Design', 'LED Retrofit', 'Accent Lighting'] },
  { id: 'WRK-005', name: 'Diego Hernandez', role: 'Apprentice Electrician', type: 'employee', email: 'diego@mscelectric.com', phone: '(555) 567-8901', location: 'Local', status: 'on-leave', rating: 4.5, projectsCompleted: 23, hourlyRate: 35, specialties: ['Residential', 'Helper'] },
  { id: 'WRK-006', name: 'Sofia Ramirez', role: 'Project Manager', type: 'employee', email: 'sofia@mscelectric.com', phone: '(555) 678-9012', location: 'Local', status: 'active', rating: 5.0, projectsCompleted: 156, specialties: ['Project Management', 'Estimating', 'Client Relations'] },
  { id: 'WRK-007', name: 'Luis Torres', role: 'Safety Inspector', type: 'subcontractor', email: 'luis@safetyfirst.com', phone: '(555) 789-0123', location: 'Remote - California', status: 'inactive', rating: 4.8, projectsCompleted: 89, hourlyRate: 80, specialties: ['Safety Inspections', 'Code Compliance', 'Training'] },
  { id: 'WRK-008', name: 'Elena Castro', role: 'Smart Home Technician', type: 'employee', email: 'elena@mscelectric.com', phone: '(555) 890-1234', location: 'Local', status: 'active', rating: 4.7, projectsCompleted: 45, currentProject: 'Smith Smart Home Installation', hourlyRate: 60, specialties: ['Smart Home', 'Automation', 'Low Voltage'] },
];

const statusColors = {
  'active': 'bg-green-500/20 text-green-400',
  'inactive': 'bg-gray-500/20 text-gray-400',
  'on-leave': 'bg-yellow-500/20 text-yellow-400',
};

const statusLabels = {
  'active': 'Active',
  'inactive': 'Inactive',
  'on-leave': 'On Leave',
};

const typeColors = {
  'employee': 'bg-[#F2C94C]/20 text-[#F2C94C]',
  'subcontractor': 'bg-blue-500/20 text-blue-400',
};

export function WorkersManager() {
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({
    name: '',
    role: '',
    type: 'employee',
    email: '',
    phone: '',
    location: '',
    status: 'active',
    hourlyRate: 0,
    specialties: [],
  });

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worker.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
    const matchesType = typeFilter === 'all' || worker.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const subcontractors = workers.filter(w => w.type === 'subcontractor').length;
  const avgRating = workers.reduce((sum, w) => sum + w.rating, 0) / workers.length;

  const handleAddWorker = () => {
    const { id: _, ...workerData } = newWorker as Worker;
    const worker: Worker = {
      id: `WRK-${String(workers.length + 1).padStart(3, '0')}`,
      ...workerData,
      rating: 0,
      projectsCompleted: 0,
      specialties: newWorker.specialties || [],
    };
    setWorkers([...workers, worker]);
    setIsAddDialogOpen(false);
    toast.success('Worker added successfully');
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers(workers.filter(w => w.id !== workerId));
    toast.success('Worker removed successfully');
  };

  const handleStatusChange = (workerId: string, status: Worker['status']) => {
    setWorkers(workers.map(w => w.id === workerId ? { ...w, status } : w));
    toast.success(`Status updated to ${statusLabels[status]}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#F2C94C]" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Total Workers</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{totalWorkers}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Active</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{activeWorkers}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Subcontractors</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{subcontractors}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Avg Rating</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{avgRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors w-48"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
          >
            <option value="all" className="bg-[#0B0C0F]">All Status</option>
            <option value="active" className="bg-[#0B0C0F]">Active</option>
            <option value="inactive" className="bg-[#0B0C0F]">Inactive</option>
            <option value="on-leave" className="bg-[#0B0C0F]">On Leave</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
          >
            <option value="all" className="bg-[#0B0C0F]">All Types</option>
            <option value="employee" className="bg-[#0B0C0F]">Employee</option>
            <option value="subcontractor" className="bg-[#0B0C0F]">Subcontractor</option>
          </select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Worker
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#111318] border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#F6F7F9] font-display">Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Full Name</label>
                <input
                  type="text"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Role</label>
                  <input
                    type="text"
                    value={newWorker.role}
                    onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                    placeholder="e.g. Electrician"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Type</label>
                  <select
                    value={newWorker.type}
                    onChange={(e) => setNewWorker({ ...newWorker, type: e.target.value as Worker['type'] })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  >
                    <option value="employee" className="bg-[#0B0C0F]">Employee</option>
                    <option value="subcontractor" className="bg-[#0B0C0F]">Subcontractor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Email</label>
                <input
                  type="email"
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newWorker.phone}
                    onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Hourly Rate</label>
                  <input
                    type="number"
                    value={newWorker.hourlyRate}
                    onChange={(e) => setNewWorker({ ...newWorker, hourlyRate: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Location</label>
                <input
                  type="text"
                  value={newWorker.location}
                  onChange={(e) => setNewWorker({ ...newWorker, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="e.g. Local or Remote - State"
                />
              </div>
              <button
                onClick={handleAddWorker}
                className="w-full btn-primary py-3 mt-4"
              >
                Add Worker
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className="glass-card rounded-xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                  <span className="font-display font-semibold text-[#F2C94C]">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-[#F6F7F9] font-medium">{worker.name}</h3>
                  <p className="text-[#A9AFB8] text-sm">{worker.role}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-[#6A6D75] hover:text-[#F6F7F9] transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#111318] border-white/10">
                  <DropdownMenuItem className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer">
                    <Eye className="w-4 h-4 mr-2" /> View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-green-400 focus:bg-green-500/10 cursor-pointer"
                    onClick={() => handleStatusChange(worker.id, 'active')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Set Active
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-yellow-400 focus:bg-yellow-500/10 cursor-pointer"
                    onClick={() => handleStatusChange(worker.id, 'on-leave')}
                  >
                    <Clock className="w-4 h-4 mr-2" /> Set On Leave
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                    onClick={() => handleDeleteWorker(worker.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[worker.status]}`}>
                {statusLabels[worker.status]}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[worker.type]}`}>
                {worker.type === 'employee' ? 'Employee' : 'Subcontractor'}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#6A6D75]" />
                <span className="text-[#A9AFB8]">{worker.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#6A6D75]" />
                <span className="text-[#A9AFB8]">{worker.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#6A6D75]" />
                <span className="text-[#A9AFB8]">{worker.location}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-[#F6F7F9] font-display font-bold">{worker.projectsCompleted}</p>
                <p className="text-[#6A6D75] text-xs">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-[#F6F7F9] font-display font-bold">{worker.rating}</p>
                <p className="text-[#6A6D75] text-xs">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-[#F6F7F9] font-display font-bold">${worker.hourlyRate}</p>
                <p className="text-[#6A6D75] text-xs">/hr</p>
              </div>
            </div>

            {/* Current Project */}
            {worker.currentProject && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#F2C94C]" />
                  <span className="text-[#A9AFB8] text-sm truncate">{worker.currentProject}</span>
                </div>
              </div>
            )}

            {/* Specialties */}
            <div className="mt-4 flex flex-wrap gap-2">
              {worker.specialties.map((specialty, idx) => (
                <span key={idx} className="px-2 py-1 bg-white/5 rounded text-xs text-[#A9AFB8]">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
