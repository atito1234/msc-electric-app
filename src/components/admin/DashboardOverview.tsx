import { useState } from 'react';
import { 
  FolderKanban, 
  Receipt, 
  FileText, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const projectStatusData = [
  { name: 'Completed', value: 45, color: '#F2C94C' },
  { name: 'In Progress', value: 28, color: '#3B82F6' },
  { name: 'Pending', value: 15, color: '#6B7280' },
  { name: 'On Hold', value: 12, color: '#EF4444' },
];

const recentActivity = [
  { id: 1, type: 'project', title: 'New project created', description: 'Residential panel upgrade - Johnson Residence', time: '2 hours ago' },
  { id: 2, type: 'invoice', title: 'Invoice paid', description: 'Invoice #INV-2024-0012 - $4,500', time: '4 hours ago' },
  { id: 3, type: 'contract', title: 'Contract signed', description: 'Commercial fit-out - Downtown Plaza', time: '6 hours ago' },
  { id: 4, type: 'worker', title: 'Worker assigned', description: 'Maria Garcia assigned to EV Charger Install', time: '8 hours ago' },
  { id: 5, type: 'project', title: 'Project completed', description: 'Smart home automation - Smith Residence', time: '1 day ago' },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
}

function StatCard({ title, value, change, isPositive, icon: Icon }: StatCardProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#F2C94C]/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#F2C94C]" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <h3 className="text-[#6A6D75] text-sm font-mono mb-1">{title}</h3>
      <p className="text-[#F6F7F9] text-2xl font-display font-bold">{value}</p>
    </div>
  );
}

export function DashboardOverview() {
  const [stats] = useState({
    totalProjects: 124,
    totalRevenue: 328000,
    activeContracts: 18,
    totalWorkers: 24,
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects.toString()}
          change="+12%"
          isPositive={true}
          icon={FolderKanban}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}k`}
          change="+8%"
          isPositive={true}
          icon={Receipt}
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts.toString()}
          change="+3"
          isPositive={true}
          icon={FileText}
        />
        <StatCard
          title="Total Workers"
          value={stats.totalWorkers.toString()}
          change="+2"
          isPositive={true}
          icon={Users}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-[#F6F7F9] mb-6">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D35" />
                <XAxis dataKey="month" stroke="#6A6D75" fontSize={12} />
                <YAxis stroke="#6A6D75" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111318', border: '1px solid #2A2D35', borderRadius: '8px' }}
                  itemStyle={{ color: '#F6F7F9' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#F2C94C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-[#F6F7F9] mb-6">Project Status</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111318', border: '1px solid #2A2D35', borderRadius: '8px' }}
                  itemStyle={{ color: '#F6F7F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4">
              {projectStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[#A9AFB8]">{item.name}</span>
                  <span className="text-sm text-[#F6F7F9] font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-[#F6F7F9] mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'project' ? 'bg-blue-500/20' :
                  activity.type === 'invoice' ? 'bg-green-500/20' :
                  activity.type === 'contract' ? 'bg-purple-500/20' :
                  'bg-orange-500/20'
                }`}>
                  {activity.type === 'project' && <FolderKanban className="w-5 h-5 text-blue-400" />}
                  {activity.type === 'invoice' && <Receipt className="w-5 h-5 text-green-400" />}
                  {activity.type === 'contract' && <FileText className="w-5 h-5 text-purple-400" />}
                  {activity.type === 'worker' && <Users className="w-5 h-5 text-orange-400" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-[#F6F7F9] font-medium text-sm">{activity.title}</h4>
                  <p className="text-[#A9AFB8] text-sm">{activity.description}</p>
                </div>
                <span className="text-[#6A6D75] text-xs font-mono">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-[#F6F7F9] mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#F2C94C]" />
                <span className="text-[#A9AFB8] text-sm">This Week</span>
              </div>
              <span className="text-[#F6F7F9] font-medium">8 Projects</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
                <span className="text-[#A9AFB8] text-sm">Pending</span>
              </div>
              <span className="text-[#F6F7F9] font-medium">12 Tasks</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-[#A9AFB8] text-sm">Completed</span>
              </div>
              <span className="text-[#F6F7F9] font-medium">45 Jobs</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-[#A9AFB8] text-sm">Urgent</span>
              </div>
              <span className="text-[#F6F7F9] font-medium">3 Issues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
