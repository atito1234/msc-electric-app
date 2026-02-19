import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Receipt, 
  Users, 
  LogOut,
  Menu,
  Zap,
  Bell,
  Search
} from 'lucide-react';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { ProjectsManager } from '@/components/admin/ProjectsManager';
import { InvoicesManager } from '@/components/admin/InvoicesManager';
import { ContractsManager } from '@/components/admin/ContractsManager';
import { WorkersManager } from '@/components/admin/WorkersManager';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'projects' | 'invoices' | 'contracts' | 'workers';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully');
  };

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderKanban },
    { id: 'invoices' as TabType, label: 'Invoices', icon: Receipt },
    { id: 'contracts' as TabType, label: 'Contracts', icon: FileText },
    { id: 'workers' as TabType, label: 'Workers', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'projects':
        return <ProjectsManager />;
      case 'invoices':
        return <InvoicesManager />;
      case 'contracts':
        return <ContractsManager />;
      case 'workers':
        return <WorkersManager />;
      default:
        return <DashboardOverview />;
    }
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111318] border-r border-white/10 transform transition-transform duration-300 lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-[#F2C94C]/20 text-[#F2C94C]'
                  : 'text-[#A9AFB8] hover:bg-white/5 hover:text-[#F6F7F9]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
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
            <h2 className="font-display font-semibold text-[#F6F7F9] capitalize">
              {activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-white/5 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-[#6A6D75] mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none w-48"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-[#A9AFB8] hover:text-[#F6F7F9] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F2C94C] rounded-full" />
            </button>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                <span className="font-display font-semibold text-[#F2C94C] text-sm">A</span>
              </div>
              <span className="hidden md:block text-sm text-[#F6F7F9]">Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
