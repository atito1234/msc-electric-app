import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Receipt,
  Users,
  Map as MapIcon,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Zap,
  Bell,
  Search,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { Project, Invoice, User } from '@/lib/database';
import { db, computeAnalytics } from '@/lib/supabase-database';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// Admin sub-pages
import { AdminProjects } from './admin/AdminProjects';
import { AdminInvoices } from './admin/AdminInvoices';
import { AdminContracts } from './admin/AdminContracts';
import { AdminWorkers } from './admin/AdminWorkers';
import { AdminMap } from './admin/AdminMap';
import { AdminSettings } from './admin/AdminSettings';

const COLORS = ['#F2C94C', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#6B7280'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
}

function StatCard({ title, value, change, isPositive = true, icon: Icon }: StatCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 hover:border-[#F2C94C]/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#F2C94C]" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-[#F6F7F9] text-2xl font-display font-bold">{value}</p>
    </div>
  );
}

function DashboardOverview() {
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['admin-projects'],
    queryFn: db.getProjects,
  });

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['admin-invoices'],
    queryFn: db.getInvoices,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: db.getUsers,
  });

  const isLoading = isLoadingProjects || isLoadingInvoices || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#F2C94C] animate-spin" />
      </div>
    );
  }

  const analytics = computeAnalytics(projects, invoices, users);

  // Recent projects logic
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (!analytics) return null;

  const projectStatusData = Object.entries(analytics.projectsByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={analytics.totalProjects}
          change="+12%"
          isPositive={true}
          icon={FolderKanban}
        />
        <StatCard
          title="Active Projects"
          value={analytics.activeProjects}
          change="+3"
          isPositive={true}
          icon={CheckCircle}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(analytics.totalRevenue / 1000).toFixed(0)}k`}
          change="+8%"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Outstanding"
          value={`$${(analytics.outstandingInvoices / 1000).toFixed(1)}k`}
          change="-5%"
          isPositive={true}
          icon={Clock}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-[#F6F7F9]">Revenue Overview</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-[#A9AFB8]">
              <option>Last 6 Months</option>
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F2C94C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F2C94C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D35" />
                <XAxis dataKey="month" stroke="#6A6D75" fontSize={12} />
                <YAxis stroke="#6A6D75" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111318', border: '1px solid #2A2D35', borderRadius: '8px' }}
                  itemStyle={{ color: '#F6F7F9' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F2C94C" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-[#F6F7F9] mb-6">Project Status Distribution</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111318', border: '1px solid #2A2D35', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {projectStatusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-[#A9AFB8]">{item.name}</span>
                  <span className="text-sm text-[#F6F7F9] font-medium ml-auto">{item.value as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-[#F6F7F9]">Recent Projects</h3>
            <a href="/admin/projects" className="text-[#F2C94C] text-sm hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className={`w-2 h-2 rounded-full ${project.status === 'in-progress' ? 'bg-blue-400' :
                  project.status === 'completed' ? 'bg-green-400' :
                    project.status === 'cancelled' ? 'bg-red-400' :
                      'bg-gray-400'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#F6F7F9] font-medium text-sm truncate">{project.name}</p>
                  <p className="text-[#6A6D75] text-xs">{project.clientId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#F6F7F9] text-sm">${project.estimatedValue.toLocaleString()}</p>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
                    <div
                      className="h-full bg-[#F2C94C] rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-[#F6F7F9] mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => toast.info('Create Project - Coming Soon')}
              className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-[#F2C94C]/20 hover:border-[#F2C94C]/50 border border-transparent transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F2C94C]/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#F2C94C]" />
              </div>
              <span className="text-[#F6F7F9] text-sm">Create New Project</span>
            </button>
            <button
              onClick={() => toast.info('AI Invoice - Coming Soon')}
              className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-[#F2C94C]/20 hover:border-[#F2C94C]/50 border border-transparent transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-[#F6F7F9] text-sm">Generate AI Invoice</span>
            </button>
            <button
              onClick={() => toast.info('Send Reminder - Coming Soon')}
              className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-[#F2C94C]/20 hover:border-[#F2C94C]/50 border border-transparent transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[#F6F7F9] text-sm">Send Payment Reminder</span>
            </button>
            <button
              onClick={() => toast.info('Schedule Work - Coming Soon')}
              className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-[#F2C94C]/20 hover:border-[#F2C94C]/50 border border-transparent transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-[#F6F7F9] text-sm">Schedule Work Order</span>
            </button>
          </div>

          {/* Top Workers */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-4">Top Performers</h4>
            <div className="space-y-3">
              {analytics.topWorkers.slice(0, 3).map((worker: any) => (
                <div key={worker.workerId} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                    <span className="text-xs font-display font-semibold text-[#F2C94C]">
                      {worker.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F6F7F9] text-sm truncate">{worker.name}</p>
                    <p className="text-[#6A6D75] text-xs">{worker.projects} projects</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#F2C94C] text-sm">★</span>
                    <span className="text-[#F6F7F9] text-sm">{worker.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications] = useState(3);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/admin/projects' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/admin/invoices' },
    { id: 'contracts', label: 'Contracts', icon: FileText, path: '/admin/contracts' },
    { id: 'workers', label: 'Workers', icon: Users, path: '/admin/workers' },
    { id: 'map', label: 'Project Map', icon: MapIcon, path: '/admin/map' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111318] border-r border-white/10 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F2C94C]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#F6F7F9]">MSC Electric</h1>
              <p className="text-[#6A6D75] text-xs font-mono">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActivePath(item.path)
                ? 'bg-[#F2C94C]/20 text-[#F2C94C]'
                : 'text-[#A9AFB8] hover:bg-white/5 hover:text-[#F6F7F9]'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
              {item.id === 'invoices' && notifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#A9AFB8] hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-[#111318] border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#A9AFB8] hover:text-[#F6F7F9]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center bg-white/5 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-[#6A6D75] mr-2" />
              <input
                type="text"
                placeholder="Search projects, invoices, clients..."
                className="bg-transparent text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-[#A9AFB8] hover:text-[#F6F7F9] transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                <span className="font-display font-semibold text-[#F2C94C] text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-[#F6F7F9]">{user.name}</p>
                <p className="text-xs text-[#6A6D75]">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/projects" element={<AdminProjects />} />
            <Route path="/invoices" element={<AdminInvoices />} />
            <Route path="/contracts" element={<AdminContracts />} />
            <Route path="/workers" element={<AdminWorkers />} />
            <Route path="/map" element={<AdminMap />} />
            <Route path="/analytics" element={<div className="text-center py-20 text-[#A9AFB8]">Advanced Analytics - Coming Soon</div>} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}


