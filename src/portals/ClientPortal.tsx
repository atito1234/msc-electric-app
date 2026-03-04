import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Project, Invoice, Contract, Lead } from '@/lib/database';
import { db } from '@/lib/supabase-database';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIProjectEstimator } from '@/components/ui/AIProjectEstimator';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Receipt,
  MessageSquare,
  LogOut,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  ChevronRight,
  Download,
  Eye,
  HardHat,
  ClipboardList,
  Loader2
} from 'lucide-react';

export function ClientPortal() {
  const { user, logout } = useAuth();
  console.log("ClientPortal Render: user =", user);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showAIEstimator, setShowAIEstimator] = useState(false);

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['projects', user?.id],
    queryFn: () => user ? db.getProjectsByClient(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['invoices', user?.id],
    queryFn: () => user ? db.getInvoicesByClient(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery<Contract[]>({
    queryKey: ['contracts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Helper to fetch contracts if not directly exposed yet in supabase-db
      // For now returning empty or implementing mocked fetch if not ready
      return [];
    },
    enabled: !!user,
  });

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery<Lead[]>({
    queryKey: ['requests', user?.email],
    queryFn: () => user ? db.getClientRequests(user.email) : Promise.resolve([]),
    enabled: !!user,
  });

  const isLoading = isLoadingProjects || isLoadingInvoices || isLoadingContracts || isLoadingRequests;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/50',
      'inspection': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      'contracted': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      'paid': 'bg-green-500/20 text-green-400 border-green-500/50',
      'sent': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      'viewed': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'overdue': 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[status] || 'bg-zinc-500/20 text-zinc-400';
  };

  const handlePayInvoice = () => {
    toast.success('Redirecting to secure payment portal...');
  };

  const stats = {
    activeProjects: projects.filter(p => p.status === 'in-progress' || p.status === 'contracted').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalSpent: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices.filter(i => i.status === 'sent' || i.status === 'viewed').reduce((sum, i) => sum + i.total, 0),
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'requests', label: 'My Requests', icon: ClipboardList },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'contracts', label: 'Contracts', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

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
              <p className="text-zinc-500 text-xs">Client Portal</p>
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
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'Client'}</p>
              <p className="text-zinc-500 text-xs truncate">{user?.email}</p>
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
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <MessageSquare className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold text-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'M'}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.name ? user.name.split(' ')[0] : 'Client'}!
                  </h1>
                  <p className="text-zinc-400">
                    Here's what's happening with your projects.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAIEstimator(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 h-12 shadow-lg shadow-blue-900/20"
                >
                  <MessageSquare className="w-5 h-5 mr-no-blue" />
                  Start New Project w/ AI Estimator
                </Button>
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
                        <p className="text-zinc-500 text-sm">Total Invested</p>
                        <p className="text-3xl font-bold text-white">${stats.totalSpent.toLocaleString()}</p>
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
                        <p className="text-zinc-500 text-sm">Pending Payment</p>
                        <p className="text-3xl font-bold text-white">${stats.pendingAmount.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Recent Projects</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('projects')}
                    className="text-amber-500 hover:text-amber-400"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.slice(0, 2).map((project) => (
                    <Card
                      key={project.id}
                      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDialog(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-white font-semibold">{project.name}</h4>
                            <p className="text-zinc-500 text-sm">{project.address.city}, {project.address.state}</p>
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Progress</span>
                            <span className="text-white">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Invoices */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Recent Invoices</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('invoices')}
                    className="text-amber-500 hover:text-amber-400"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-0">
                    {invoices.slice(0, 3).map((invoice, idx) => (
                      <div
                        key={invoice.id}
                        className={`flex items-center justify-between p-4 ${idx !== 2 ? 'border-b border-zinc-800' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-zinc-500 text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-semibold">${invoice.total.toLocaleString()}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          {invoice.status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={handlePayInvoice}
                              className="bg-amber-500 hover:bg-amber-600 text-black"
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">My Requests</h3>
                  <p className="text-zinc-400">Track your submitted project requests and AI chat inquiries.</p>
                </div>
                <Button
                  onClick={() => window.location.href = `mailto:admin@mscelectric.io?subject=Schedule%20Consultation`}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Call
                </Button>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-zinc-500" />
                  </div>
                  <h4 className="text-white font-medium mb-2">No Requests Found</h4>
                  <p className="text-zinc-500">You haven't submitted any requests yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {requests.map((req) => (
                    <Card key={req.id} className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white text-lg">{req.serviceType || 'General Inquiry'}</CardTitle>
                            <CardDescription className="text-zinc-400 mt-1 flex items-center gap-4">
                              <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                              {req.preferredTime && <span>Prefers: {req.preferredTime}</span>}
                            </CardDescription>
                          </div>
                          <Badge className={
                            req.status === 'new' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                              req.status === 'contacted' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                                req.status === 'scheduled' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                  'bg-zinc-500/20 text-zinc-400 border-zinc-500/50'
                          }>
                            {req.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                          <p className="text-zinc-300 text-sm whitespace-pre-wrap">{req.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
                  <Card
                    key={project.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDialog(true);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white">{project.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {project.address.street}, {project.address.city}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Progress</span>
                          <span className="text-white">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Calendar className="w-4 h-4" />
                            {project.estimatedEndDate
                              ? `Est. completion: ${new Date(project.estimatedEndDate).toLocaleDateString()}`
                              : 'In progress'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Invoices</h2>
              </div>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                  {invoices.map((invoice, idx) => (
                    <div
                      key={invoice.id}
                      className={`flex items-center justify-between p-6 ${idx !== invoices.length - 1 ? 'border-b border-zinc-800' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{invoice.invoiceNumber}</p>
                          <p className="text-zinc-500 text-sm">
                            {new Date(invoice.createdAt).toLocaleDateString()} • Due {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">${invoice.total.toLocaleString()}</p>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceDialog(true);
                            }}
                            className="border-zinc-700 text-zinc-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={handlePayInvoice}
                              className="bg-amber-500 hover:bg-amber-600 text-black"
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Contracts</h2>
              </div>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Card key={contract.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-zinc-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{contract.title}</h3>
                            <p className="text-zinc-500 text-sm">{contract.contractNumber}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Signed {contract.companySignedAt ? new Date(contract.companySignedAt).toLocaleDateString() : 'Pending'}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ${contract.totalValue.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Messages</h2>
              </div>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Messages Yet</h3>
                  <p className="text-zinc-500">Your project communications will appear here</p>
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
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400 text-sm">{selectedProject.priority} priority</span>
              </div>

              <p className="text-zinc-300">{selectedProject.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg">
                  <MapPin className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-zinc-500 text-sm">Address</p>
                    <p className="text-white text-sm">{selectedProject.address.street}</p>
                    <p className="text-white text-sm">{selectedProject.address.city}, {selectedProject.address.state} {selectedProject.address.zip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg">
                  <DollarSign className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-zinc-500 text-sm">Project Value</p>
                    <p className="text-white">${selectedProject.estimatedValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Completion</span>
                    <span className="text-white">{selectedProject.progress}%</span>
                  </div>
                  <Progress value={selectedProject.progress} className="h-3" />
                </div>
              </div>

              {selectedProject.workOrders.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Work Orders
                  </h4>
                  <div className="space-y-2">
                    {selectedProject.workOrders.map((wo) => (
                      <div key={wo.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                        <div>
                          <p className="text-white text-sm">{wo.title}</p>
                          <p className="text-zinc-500 text-xs">{wo.description}</p>
                        </div>
                        <Badge className={getStatusColor(wo.status)}>
                          {wo.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.assignedElectricians.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <HardHat className="w-4 h-4" />
                    Team
                  </h4>
                  <div className="flex gap-2">
                    {selectedProject.assignedElectricians.map((empId) => (
                      <div key={empId} className="flex items-center gap-2 px-3 py-2 bg-zinc-950 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-bold">
                          E
                        </div>
                        <span className="text-zinc-300 text-sm">Electrician</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedInvoice.status)}>
                  {selectedInvoice.status}
                </Badge>
                <span className="text-zinc-400 text-sm">
                  Due {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-zinc-500 text-sm">Line Items</h4>
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-zinc-300">{item.description} ({item.quantity} x ${item.unitPrice})</span>
                    <span className="text-white">${item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-white">${selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tax ({((selectedInvoice.taxAmount / selectedInvoice.subtotal) * 100).toFixed(1)}%)</span>
                  <span className="text-white">${selectedInvoice.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-amber-500">${selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>

              {selectedInvoice.status !== 'paid' && (
                <Button
                  onClick={handlePayInvoice}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                >
                  Pay ${selectedInvoice.total.toLocaleString()}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Estimator Modal */}
      <AIProjectEstimator
        isOpen={showAIEstimator}
        onClose={() => setShowAIEstimator(false)}
      />
    </div>
  );
}
