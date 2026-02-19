import { useState, useEffect } from 'react';
// Map icons removed - using CSS markers instead
import type { Project } from '@/lib/database';
import { db } from '@/lib/database';

export function AdminMap() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setProjects(db.getProjects());
  }, []);

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'active') return p.status === 'in-progress' || p.status === 'contracted';
    if (filter === 'completed') return p.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'contracted': return '#8B5CF6';
      case 'on-hold': return '#EF4444';
      default: return '#F2C94C';
    }
  };

  // Simulated map view (in production, use Google Maps or Mapbox)
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">Project Map</h2>
          <p className="text-[#A9AFB8]">Visualize all projects and their locations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'all' ? 'bg-[#F2C94C]/20 text-[#F2C94C]' : 'bg-white/5 text-[#A9AFB8]'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'active' ? 'bg-[#F2C94C]/20 text-[#F2C94C]' : 'bg-white/5 text-[#A9AFB8]'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'completed' ? 'bg-[#F2C94C]/20 text-[#F2C94C]' : 'bg-white/5 text-[#A9AFB8]'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="glass-card rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="relative w-full h-full bg-[#0f1115]">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              {/* Grid lines */}
              {Array.from({ length: 20 }).map((_, i) => (
                <line key={`h-${i}`} x1="0" y1={i * 30} x2="800" y2={i * 30} stroke="#2A2D35" strokeWidth="1" />
              ))}
              {Array.from({ length: 27 }).map((_, i) => (
                <line key={`v-${i}`} x1={i * 30} y1="0" x2={i * 30} y2="600" stroke="#2A2D35" strokeWidth="1" />
              ))}
              {/* Roads */}
              <line x1="0" y1="200" x2="800" y2="200" stroke="#3A3D45" strokeWidth="4" />
              <line x1="0" y1="400" x2="800" y2="400" stroke="#3A3D45" strokeWidth="4" />
              <line x1="200" y1="0" x2="200" y2="600" stroke="#3A3D45" strokeWidth="4" />
              <line x1="600" y1="0" x2="600" y2="600" stroke="#3A3D45" strokeWidth="4" />
            </svg>
          </div>

          {/* Project Markers */}
          {filteredProjects.map((project) => {
            // Generate pseudo-random positions based on project ID
            const hash = project.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const x = 15 + (hash % 70);
            const y = 15 + ((hash * 7) % 70);
            
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="relative">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  />
                  <div 
                    className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-50"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#111318] border border-white/10 rounded-lg px-3 py-2 whitespace-nowrap">
                    <p className="text-[#F6F7F9] text-sm font-medium">{project.name}</p>
                    <p className="text-[#6A6D75] text-xs">${project.estimatedValue.toLocaleString()}</p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-card rounded-lg p-4">
            <p className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Legend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-[#A9AFB8]">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-[#A9AFB8]">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-[#A9AFB8]">Contracted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F2C94C]" />
                <span className="text-sm text-[#A9AFB8]">Other</span>
              </div>
            </div>
          </div>

          {/* Selected Project Panel */}
          {selectedProject && (
            <div className="absolute top-4 right-4 w-80 glass-card rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-[#F6F7F9]">{selectedProject.name}</h3>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-[#6A6D75] hover:text-[#F6F7F9]"
                >
                  ×
                </button>
              </div>
              <p className="text-[#A9AFB8] text-sm mb-4">{selectedProject.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6A6D75]">Status</span>
                  <span className="text-[#F6F7F9]">{selectedProject.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6D75]">Value</span>
                  <span className="text-[#F6F7F9]">${selectedProject.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6D75]">Progress</span>
                  <span className="text-[#F6F7F9]">{selectedProject.progress}%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <button 
                  onClick={() => window.location.href = `/admin/projects`}
                  className="w-full py-2 bg-[#F2C94C]/20 rounded-lg text-sm text-[#F2C94C] hover:bg-[#F2C94C]/30 transition-colors"
                >
                  View Project Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
