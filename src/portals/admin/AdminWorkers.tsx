import { useState, useEffect } from 'react';
import { Plus, Search, Star, MapPin, Phone, Mail, Briefcase } from 'lucide-react';
import type { User, UserRole } from '@/lib/database';
import { db } from '@/lib/supabase-database';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AdminWorkers() {
  const [workers, setWorkers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const allUsers = await db.getUsers();
      setWorkers(allUsers.filter((u: User) => u.role === 'employee' || u.role === 'subcontractor'));
    };
    loadData();
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || worker.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const employees = workers.filter(w => w.role === 'employee');
  const subcontractors = workers.filter(w => w.role === 'subcontractor');
  const avgRating = workers.reduce((sum, w) => sum + ((w as any).rating || 0), 0) / workers.length || 0;

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-orange-400';
      case 'off': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Total Workers</p>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{workers.length}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Employees</p>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{employees.length}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Subcontractors</p>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{subcontractors.length}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Avg Rating</p>
          <p className="text-[#F2C94C] text-2xl font-display font-bold">{avgRating.toFixed(1)} ★</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">Workers</h2>
          <p className="text-[#A9AFB8]">Manage employees and subcontractors</p>
        </div>
        <button
          onClick={() => toast.info('Add Worker - Coming Soon')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Worker
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
          <input
            type="text"
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] [&>option]:bg-[#111318] focus:outline-none focus:border-[#F2C94C]"
        >
          <option value="all">All Roles</option>
          <option value="employee">Employees</option>
          <option value="subcontractor">Subcontractors</option>
        </select>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => {
          const workerData = worker as any;
          return (
            <div key={worker.id} className="glass-card rounded-xl p-5 hover:border-[#F2C94C]/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                    <span className="font-display font-semibold text-[#F2C94C]">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#F6F7F9] font-medium">{worker.name}</p>
                    <p className="text-[#6A6D75] text-sm">{workerData.title || worker.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.role === 'employee' ? 'bg-[#F2C94C]/20 text-[#F2C94C]' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                  {worker.role === 'employee' ? 'Employee' : 'Subcontractor'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#A9AFB8]">
                  <Star className="w-4 h-4 text-[#F2C94C]" />
                  <span>{workerData.rating || 0} / 5.0</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#A9AFB8]">
                  <Briefcase className="w-4 h-4" />
                  <span>{workerData.completedProjects || workerData.assignedProjects?.length || 0} projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#A9AFB8]">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{worker.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(workerData.availability).replace('text-', 'bg-')}`} />
                  <span className={`text-sm capitalize ${getAvailabilityColor(workerData.availability)}`}>
                    {workerData.availability}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedWorker(worker); setIsViewOpen(true); }}
                  className="text-[#F2C94C] text-sm hover:underline"
                >
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-[#111318] border-white/10 max-w-xl">
          {selectedWorker && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#F6F7F9] font-display">Worker Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                    <span className="font-display font-semibold text-[#F2C94C] text-xl">
                      {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[#F6F7F9] font-display font-bold text-xl">{selectedWorker.name}</h3>
                    <p className="text-[#A9AFB8]">{(selectedWorker as any).title || selectedWorker.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4 text-center">
                    <p className="text-[#6A6D75] text-xs mb-1">Rating</p>
                    <p className="text-[#F2C94C] text-2xl font-display font-bold">{(selectedWorker as any).rating || 0} ★</p>
                  </div>
                  <div className="glass-card rounded-lg p-4 text-center">
                    <p className="text-[#6A6D75] text-xs mb-1">Projects</p>
                    <p className="text-[#F6F7F9] text-2xl font-display font-bold">{(selectedWorker as any).completedProjects || 0}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[#A9AFB8]">
                    <Mail className="w-5 h-5" />
                    <span>{selectedWorker.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#A9AFB8]">
                    <Phone className="w-5 h-5" />
                    <span>{selectedWorker.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#A9AFB8]">
                    <MapPin className="w-5 h-5" />
                    <span>{(selectedWorker as any).location || 'Local'}</span>
                  </div>
                </div>

                {(selectedWorker as any).specialties && (
                  <div>
                    <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedWorker as any).specialties.map((spec: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-sm text-[#F6F7F9]">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-[#F2C94C]/20 rounded-lg text-sm text-[#F2C94C] hover:bg-[#F2C94C]/30 transition-colors">
                    Edit Profile
                  </button>
                  <button className="flex-1 py-2 bg-white/5 rounded-lg text-sm text-[#F6F7F9] hover:bg-white/10 transition-colors">
                    View Schedule
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
