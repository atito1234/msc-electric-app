import { useState, useEffect } from 'react';
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
  Package,
  Clock,
  LogOut,
  MapPin,
  CheckCircle,
  AlertCircle,
  Wrench,
  HardHat,
  ChevronRight,
  Play,
  Square,
  Plus,
  MessageSquare,
  Loader2
} from 'lucide-react';

export function EmployeePortal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['employee-projects', user?.id],
    queryFn: () => user ? db.getProjectsByWorker(user.id) : Promise.resolve([]),
    enabled: !!user && user.role === 'employee',
  });

  // Effect for timer logic remains the same
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTimer && timerStart) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - timerStart.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerStart]);

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

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (projectId: string) => {
    setActiveTimer(projectId);
    setTimerStart(new Date());
    setElapsedTime(0);
    toast.success('Timer started');
  };

  const stopTimer = () => {
    if (activeTimer && timerStart) {
      const hours = elapsedTime / 3600;
      toast.success(`Logged ${hours.toFixed(2)} hours`);
      setActiveTimer(null);
      setTimerStart(null);
      setElapsedTime(0);
    }
  };

  const stats = {
    activeProjects: projects.filter((p: Project) => p.status === 'in-progress').length,
    completedToday: 3, // Simulated
    hoursThisWeek: 42, // Simulated
    pendingWorkOrders: projects.reduce((sum: number, p: Project) =>
      sum + p.workOrders.filter((wo: any) => wo.status === 'pending').length, 0
    ),
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'workorders', label: 'Work Orders', icon: ClipboardList },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'time', label: 'Time Tracking', icon: Clock },
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
              <p className="text-zinc-500 text-xs">Employee Portal</p>
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
              <p className="text-zinc-500 text-xs truncate">{(user as any)?.title || 'Electrician'}</p>
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
              {activeTimer && (
                <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/20 rounded-lg border border-amber-500/50">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-amber-400 font-mono font-bold">{formatTime(elapsedTime)}</span>
                  <button onClick={stopTimer} className="text-amber-400 hover:text-amber-300">
                    <Square className="w-4 h-4" />
                  </button>
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
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name.split(' ')[0]}!
                </h1>
                <p className="text-zinc-400">
                  Here's your work overview for today
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
                        <p className="text-zinc-500 text-sm">Completed Today</p>
                        <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
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
                        <p className="text-zinc-500 text-sm">Hours This Week</p>
                        <p className="text-3xl font-bold text-white">{stats.hoursThisWeek}h</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-500 text-sm">Pending WO</p>
                        <p className="text-3xl font-bold text-white">{stats.pendingWorkOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Schedule */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Today's Schedule</h3>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project: Project, idx: number) => (
                    <Card key={project.id} className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                              <span className="text-amber-500 font-bold">{idx + 1}</span>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{project.name}</h4>
                              <p className="text-zinc-500 text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {project.address.street}, {project.address.city}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            {!activeTimer && (
                              <Button
                                size="sm"
                                onClick={() => startTimer(project.id)}
                                className="bg-amber-500 hover:bg-amber-600 text-black"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start
                              </Button>
                            )}
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
                    onClick={() => setActiveTab('time')}
                  >
                    <Clock className="w-6 h-6 text-amber-500" />
                    <span className="text-zinc-300">Log Time</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('materials')}
                  >
                    <Package className="w-6 h-6 text-amber-500" />
                    <span className="text-zinc-300">Request Materials</span>
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
                    <MessageSquare className="w-6 h-6 text-amber-500" />
                    <span className="text-zinc-300">Message Team</span>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white">{project.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {project.address.city}, {project.address.state}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400 text-sm mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardHat className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-400 text-sm">
                            {project.workOrders.filter(wo => wo.status === 'completed').length}/{project.workOrders.length} tasks
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowProjectDialog(true);
                          }}
                          className="border-zinc-700 text-zinc-300"
                        >
                          View Details
                        </Button>
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
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(wo.status)}>
                            {wo.status}
                          </Badge>
                          {wo.status === 'pending' && (
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                              Start
                            </Button>
                          )}
                          {wo.status === 'in-progress' && (
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                              Complete
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

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Materials</h2>
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Materials
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.flatMap((p: Project) => p.materials.map((m: any) => ({ ...m, projectName: p.name }))).map((material: any) => (
                  <Card key={material.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{material.name}</h4>
                            <p className="text-zinc-500 text-sm">{material.projectName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{material.quantity} {material.unit}</p>
                          <Badge className={material.delivered ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                            {material.delivered ? 'Delivered' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Time Tracking Tab */}
          {activeTab === 'time' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Time Tracking</h2>
              </div>

              {/* Active Timer Card */}
              {activeTimer && (
                <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-400 text-sm">Active Timer</p>
                        <p className="text-white text-lg font-semibold">
                          {projects.find(p => p.id === activeTimer)?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-mono font-bold text-amber-500">{formatTime(elapsedTime)}</p>
                        <Button
                          size="sm"
                          onClick={stopTimer}
                          className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Stop & Log
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Time Entries */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">This Week's Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
                      <div key={day} className="flex items-center justify-between py-2">
                        <span className="text-zinc-400 w-12">{day}</span>
                        <div className="flex-1 mx-4">
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${[8, 9, 7, 10, 8][idx] * 10}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-white w-16 text-right">{[8, 9, 7, 10, 8][idx]}h</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-amber-500 font-bold">42 hours</span>
                  </div>
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
              </div>

              {/* Work Orders */}
              <div>
                <h4 className="text-white font-medium mb-3">Work Orders</h4>
                <div className="space-y-2">
                  {selectedProject.workOrders.map((wo) => (
                    <div key={wo.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                      <div>
                        <p className="text-white text-sm">{wo.title}</p>
                        <p className="text-zinc-500 text-xs">{wo.estimatedHours}h estimated</p>
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
                <h4 className="text-white font-medium mb-3">Required Materials</h4>
                <div className="space-y-2">
                  {selectedProject.materials.map((mat) => (
                    <div key={mat.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-zinc-500" />
                        <span className="text-white text-sm">{mat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 text-sm">{mat.quantity} {mat.unit}</span>
                        <Badge className={mat.delivered ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                          {mat.delivered ? 'Delivered' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!activeTimer && (
                <Button
                  onClick={() => {
                    startTimer(selectedProject.id);
                    setShowProjectDialog(false);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Working
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
