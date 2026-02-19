import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Project } from '@/lib/database';
import { db } from '@/lib/supabase-database';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  MapPin,
  Clock,
  LogOut,
  CheckCircle,
  ChevronRight,
  Briefcase,
  Star,
  Calendar,
  DollarSign,
  Navigation,
  MessageSquare,
  FileText,
  Wrench,
  Loader2
} from 'lucide-react';

export function SubcontractorPortal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [checkedInProject, setCheckedInProject] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['subcontractor-projects', user?.id],
    queryFn: () => user ? db.getProjectsByWorker(user.id) : Promise.resolve([]),
    enabled: !!user && user.role === 'subcontractor',
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/50',
      'inspection': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      'pending': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50',
      'approved': 'bg-green-500/20 text-green-400 border-green-500/50',
    };
    return colors[status] || 'bg-zinc-500/20 text-zinc-400';
  };

  const handleCheckIn = (projectId: string) => {
    setCheckedInProject(projectId);
    setShowCheckInDialog(false);
    toast.success('Checked in successfully!');
  };

  const handleCheckOut = () => {
    setCheckedInProject(null);
    toast.success('Checked out. Hours logged.');
  };

  const stats = {
    activeProjects: projects.filter((p: Project) => p.status === 'in-progress').length,
    completedProjects: projects.filter((p: Project) => p.status === 'completed').length,
    totalEarnings: 24500, // Simulated
    rating: (user as any)?.rating || 4.8,
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'workorders', label: 'Work Orders', icon: ClipboardList },
    { id: 'availability', label: 'Availability', icon: Calendar },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-white font-bold">MSC Electric</h1>
              <p className="text-zinc-500 text-xs">Partner Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                  ? 'bg-amber-500 text-black font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-zinc-500 text-xs">{stats.rating}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              {checkedInProject && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">Checked In</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCheckOut}
                    className="text-green-400 hover:text-green-300 ml-2"
                  >
                    Check Out
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <MessageSquare className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold text-sm">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.name.split(' ')[0]}!
                </h1>
                <p className="text-zinc-400">
                  Here's your partnership overview
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-500 text-sm">Active Projects</p>
                        <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <FolderKanban className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-500 text-sm">Completed</p>
                        <p className="text-3xl font-bold text-white">{stats.completedProjects}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-500 text-sm">This Month</p>
                        <p className="text-3xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-500 text-sm">Rating</p>
                        <p className="text-3xl font-bold text-white">{stats.rating}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Active Projects</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('projects')}
                    className="text-amber-500 hover:text-amber-400"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {projects.filter((p: Project) => p.status === 'in-progress').slice(0, 3).map((project: Project) => (
                    <Card key={project.id} className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                              <Briefcase className="w-6 h-6 text-zinc-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{project.name}</h4>
                              <p className="text-zinc-500 text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {project.address.city}, {project.address.state}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!checkedInProject ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowCheckInDialog(true);
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-black"
                              >
                                Check In
                              </Button>
                            ) : checkedInProject === project.id ? (
                              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setShowProjectDialog(true);
                              }}
                              className="text-zinc-400"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-6 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('availability')}
                  >
                    <Calendar className="w-6 h-6 text-amber-500" />
                    <span className="text-zinc-300">Set Availability</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('workorders')}
                  >
                    <ClipboardList className="w-6 h-6 text-amber-500" />
                    <span className="text-zinc-300">View Work Orders</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6 text-amber-500" />
                    <span className="text-zinc-300">Submit Invoice</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex flex-col items-center gap-2"
                  >
                    <MessageSquare className="w-6 h-6 text-amber-500" />
                    <span className="text-zinc-300">Contact Admin</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Projects</h2>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-7 h-7 text-zinc-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                            <p className="text-zinc-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {project.address.street}, {project.address.city}, {project.address.state}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                              <span className="text-zinc-400 text-sm">
                                {project.workOrders.filter(wo => wo.status === 'completed').length}/{project.workOrders.length} tasks complete
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!checkedInProject && project.status === 'in-progress' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setShowCheckInDialog(true);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-black"
                            >
                              Check In
                            </Button>
                          )}
                          {checkedInProject === project.id && (
                            <Button
                              size="sm"
                              onClick={handleCheckOut}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Check Out
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowProjectDialog(true);
                            }}
                            className="border-zinc-700 text-zinc-300"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Work Orders Tab */}
          {activeTab === 'workorders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Work Orders</h2>
              </div>
              <div className="space-y-4">
                {projects.flatMap((p: Project) => p.workOrders.map((wo: any) => ({ ...wo, projectName: p.name }))).map((wo: any) => (
                  <Card key={wo.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{wo.title}</h4>
                            <p className="text-zinc-500 text-sm">{wo.projectName}</p>
                            <p className="text-zinc-400 text-sm mt-1">{wo.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {wo.estimatedHours}h estimated
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(wo.status)}>
                            {wo.status}
                          </Badge>
                          {wo.status === 'pending' && (
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                              Accept
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Set Availability</h2>
              </div>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Weekly Schedule</CardTitle>
                  <CardDescription>Set your availability for the upcoming week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                        <span className="text-white w-32">{day}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked={day !== 'Sunday'} className="rounded border-zinc-700" />
                            <span className="text-zinc-400 text-sm">Available</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <select className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-white text-sm">
                              <option>8:00 AM</option>
                              <option>9:00 AM</option>
                            </select>
                            <span className="text-zinc-500">to</span>
                            <select className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-white text-sm">
                              <option>5:00 PM</option>
                              <option>6:00 PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6 bg-amber-500 hover:bg-amber-600 text-black">
                    Save Availability
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Project Detail Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
              </div>

              <p className="text-zinc-300">{selectedProject.description}</p>

              <div className="p-4 bg-zinc-950 rounded-lg">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Project Location</span>
                </div>
                <p className="text-white">{selectedProject.address.street}</p>
                <p className="text-white">{selectedProject.address.city}, {selectedProject.address.state} {selectedProject.address.zip}</p>
                <Button variant="outline" size="sm" className="mt-3 border-zinc-700 text-zinc-300">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>

              {/* Work Orders */}
              <div>
                <h4 className="text-white font-medium mb-3">Assigned Work Orders</h4>
                <div className="space-y-2">
                  {selectedProject.workOrders.map((wo) => (
                    <div key={wo.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                      <div>
                        <p className="text-white text-sm">{wo.title}</p>
                        <p className="text-zinc-500 text-xs">{wo.estimatedHours}h • {wo.priority} priority</p>
                      </div>
                      <Badge className={getStatusColor(wo.status)}>
                        {wo.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <h4 className="text-white font-medium mb-3">Materials Provided</h4>
                <div className="space-y-2">
                  {selectedProject.materials.map((mat) => (
                    <div key={mat.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                      <span className="text-white text-sm">{mat.name}</span>
                      <span className="text-zinc-400 text-sm">{mat.quantity} {mat.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!checkedInProject && selectedProject.status === 'in-progress' && (
                  <Button
                    onClick={() => {
                      handleCheckIn(selectedProject.id);
                      setShowProjectDialog(false);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    Check In to Project
                  </Button>
                )}
                <Button variant="outline" className="border-zinc-700 text-zinc-300">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Check In Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Check In</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-white font-semibold text-lg">{selectedProject?.name}</h3>
              <p className="text-zinc-400">{selectedProject?.address.street}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => selectedProject && handleCheckIn(selectedProject.id)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Confirm Check In
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCheckInDialog(false)}
                className="w-full border-zinc-700 text-zinc-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
