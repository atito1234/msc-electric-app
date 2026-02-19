import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Eye,
  Download,
  Send,
  CheckCircle,
  Clock,
  FileSignature,
  FileText,
  Calendar,
  DollarSign,
  User
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

interface Contract {
  id: string;
  title: string;
  client: string;
  project: string;
  value: number;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  startDate: string;
  endDate: string;
  type: string;
  signedDate?: string;
}

const mockContracts: Contract[] = [
  { id: 'CTR-2024-0008', title: 'Residential Electrical Services Agreement', client: 'Johnson Family', project: 'Johnson Residence Panel Upgrade', value: 8500, status: 'signed', startDate: '2024-01-15', endDate: '2024-02-15', type: 'Service Agreement', signedDate: '2024-01-15' },
  { id: 'CTR-2024-0007', title: 'Commercial Electrical Contract', client: 'Downtown Plaza LLC', project: 'Downtown Plaza Commercial Fit-out', value: 45000, status: 'signed', startDate: '2024-01-10', endDate: '2024-04-10', type: 'Commercial Contract', signedDate: '2024-01-12' },
  { id: 'CTR-2024-0006', title: 'Smart Home Installation Agreement', client: 'Smith Residence', project: 'Smith Smart Home Installation', value: 12000, status: 'signed', startDate: '2023-12-01', endDate: '2024-01-31', type: 'Service Agreement', signedDate: '2023-11-28' },
  { id: 'CTR-2024-0005', title: 'EV Charging Station Contract', client: 'Maria Garcia', project: 'EV Charger Installation', value: 3500, status: 'sent', startDate: '2024-02-01', endDate: '2024-02-28', type: 'Installation Contract' },
  { id: 'CTR-2024-0004', title: 'Lighting Design Services', client: 'Bistro 42', project: 'Restaurant Lighting Redesign', value: 8000, status: 'draft', startDate: '2024-01-20', endDate: '2024-03-20', type: 'Design Contract' },
  { id: 'CTR-2024-0003', title: 'Annual Maintenance Agreement', client: 'TechCorp Inc', project: 'Office Building Maintenance', value: 15000, status: 'signed', startDate: '2024-01-01', endDate: '2024-12-31', type: 'Maintenance Contract', signedDate: '2023-12-28' },
];

const statusColors = {
  'draft': 'bg-gray-500/20 text-gray-400',
  'sent': 'bg-blue-500/20 text-blue-400',
  'signed': 'bg-green-500/20 text-green-400',
  'expired': 'bg-red-500/20 text-red-400',
};

const statusLabels = {
  'draft': 'Draft',
  'sent': 'Sent',
  'signed': 'Signed',
  'expired': 'Expired',
};

export function ContractsManager() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    title: '',
    client: '',
    project: '',
    value: 0,
    status: 'draft',
    startDate: '',
    endDate: '',
    type: '',
  });

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalContractValue = contracts.filter(c => c.status === 'signed').reduce((sum, c) => sum + c.value, 0);
  const pendingValue = contracts.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.value, 0);
  const activeContracts = contracts.filter(c => c.status === 'signed').length;

  const handleAddContract = () => {
    const { id: _, ...contractData } = newContract as Contract;
    const contract: Contract = {
      id: `CTR-2024-${String(contracts.length + 1).padStart(4, '0')}`,
      ...contractData,
    };
    setContracts([...contracts, contract]);
    setIsAddDialogOpen(false);
    toast.success('Contract created successfully');
  };

  const handleDeleteContract = (contractId: string) => {
    setContracts(contracts.filter(c => c.id !== contractId));
    toast.success('Contract deleted successfully');
  };

  const handleSendContract = (contractId: string) => {
    setContracts(contracts.map(c => c.id === contractId ? { ...c, status: 'sent' as const } : c));
    toast.success('Contract sent for signature');
  };

  const handleSignContract = (contractId: string) => {
    setContracts(contracts.map(c => c.id === contractId ? { ...c, status: 'signed' as const, signedDate: new Date().toISOString().split('T')[0] } : c));
    toast.success('Contract signed successfully');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Total Contract Value</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${totalContractValue.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Pending Signature</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${pendingValue.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/20 flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-[#F2C94C]" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Active Contracts</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{activeContracts}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
            <input
              type="text"
              placeholder="Search contracts..."
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
            <option value="draft" className="bg-[#0B0C0F]">Draft</option>
            <option value="sent" className="bg-[#0B0C0F]">Sent</option>
            <option value="signed" className="bg-[#0B0C0F]">Signed</option>
            <option value="expired" className="bg-[#0B0C0F]">Expired</option>
          </select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Contract
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#111318] border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#F6F7F9] font-display">Create New Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Contract Title</label>
                <input
                  type="text"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Enter contract title"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Client</label>
                <input
                  type="text"
                  value={newContract.client}
                  onChange={(e) => setNewContract({ ...newContract, client: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Project</label>
                <input
                  type="text"
                  value={newContract.project}
                  onChange={(e) => setNewContract({ ...newContract, project: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Project name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Contract Value</label>
                  <input
                    type="number"
                    value={newContract.value}
                    onChange={(e) => setNewContract({ ...newContract, value: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Contract Type</label>
                  <select
                    value={newContract.type}
                    onChange={(e) => setNewContract({ ...newContract, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  >
                    <option value="" className="bg-[#0B0C0F]">Select type</option>
                    <option value="Service Agreement" className="bg-[#0B0C0F]">Service Agreement</option>
                    <option value="Commercial Contract" className="bg-[#0B0C0F]">Commercial Contract</option>
                    <option value="Installation Contract" className="bg-[#0B0C0F]">Installation Contract</option>
                    <option value="Design Contract" className="bg-[#0B0C0F]">Design Contract</option>
                    <option value="Maintenance Contract" className="bg-[#0B0C0F]">Maintenance Contract</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newContract.startDate}
                    onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">End Date</label>
                  <input
                    type="date"
                    value={newContract.endDate}
                    onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  />
                </div>
              </div>
              <button
                onClick={handleAddContract}
                className="w-full btn-primary py-3 mt-4"
              >
                Create Contract
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contracts Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Contract</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Value</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Period</th>
                <th className="text-right px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#F2C94C]" />
                      <div>
                        <p className="text-[#F6F7F9] font-medium text-sm">{contract.title}</p>
                        <p className="text-[#6A6D75] text-xs font-mono">{contract.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#6A6D75]" />
                      <span className="text-[#A9AFB8] text-sm">{contract.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[contract.status]}`}>
                      {contract.status === 'signed' && <CheckCircle className="w-3 h-3" />}
                      {contract.status === 'sent' && <Clock className="w-3 h-3" />}
                      {statusLabels[contract.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#F6F7F9] text-sm font-medium">${contract.value.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6A6D75]" />
                      <span className="text-[#A9AFB8] text-sm">{contract.startDate} - {contract.endDate}</span>
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
                        <DropdownMenuItem className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </DropdownMenuItem>
                        {contract.status === 'draft' && (
                          <DropdownMenuItem 
                            className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer"
                            onClick={() => handleSendContract(contract.id)}
                          >
                            <Send className="w-4 h-4 mr-2" /> Send for Signature
                          </DropdownMenuItem>
                        )}
                        {contract.status === 'sent' && (
                          <DropdownMenuItem 
                            className="text-green-400 focus:bg-green-500/10 cursor-pointer"
                            onClick={() => handleSignContract(contract.id)}
                          >
                            <FileSignature className="w-4 h-4 mr-2" /> Sign Contract
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                          onClick={() => handleDeleteContract(contract.id)}
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
