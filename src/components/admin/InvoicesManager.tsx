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
  AlertCircle,
  DollarSign,
  FileText
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

interface Invoice {
  id: string;
  client: string;
  project: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  items: { description: string; quantity: number; rate: number }[];
}

const mockInvoices: Invoice[] = [
  { id: 'INV-2024-0012', client: 'Johnson Family', project: 'Johnson Residence Panel Upgrade', amount: 8500, status: 'paid', issueDate: '2024-01-20', dueDate: '2024-02-05', items: [{ description: 'Panel Upgrade', quantity: 1, rate: 8500 }] },
  { id: 'INV-2024-0011', client: 'Downtown Plaza LLC', project: 'Downtown Plaza Commercial Fit-out', amount: 22500, status: 'sent', issueDate: '2024-01-25', dueDate: '2024-02-25', items: [{ description: 'Phase 1 Installation', quantity: 1, rate: 22500 }] },
  { id: 'INV-2024-0010', client: 'Smith Residence', project: 'Smith Smart Home Installation', amount: 12000, status: 'paid', issueDate: '2024-01-10', dueDate: '2024-01-25', items: [{ description: 'Smart Home Package', quantity: 1, rate: 12000 }] },
  { id: 'INV-2024-0009', client: 'Maria Garcia', project: 'EV Charger Installation', amount: 3500, status: 'draft', issueDate: '2024-01-28', dueDate: '2024-02-15', items: [{ description: 'EV Charger Install', quantity: 1, rate: 3500 }] },
  { id: 'INV-2024-0008', client: 'Bistro 42', project: 'Restaurant Lighting Redesign', amount: 4000, status: 'overdue', issueDate: '2024-01-05', dueDate: '2024-01-20', items: [{ description: 'Lighting Design', quantity: 1, rate: 4000 }] },
  { id: 'INV-2024-0007', client: 'TechCorp Inc', project: 'Office Building Safety Inspection', amount: 2500, status: 'paid', issueDate: '2024-01-08', dueDate: '2024-01-15', items: [{ description: 'Safety Inspection', quantity: 1, rate: 2500 }] },
];

const statusColors = {
  'draft': 'bg-gray-500/20 text-gray-400',
  'sent': 'bg-blue-500/20 text-blue-400',
  'paid': 'bg-green-500/20 text-green-400',
  'overdue': 'bg-red-500/20 text-red-400',
};

const statusLabels = {
  'draft': 'Draft',
  'sent': 'Sent',
  'paid': 'Paid',
  'overdue': 'Overdue',
};

export function InvoicesManager() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    client: '',
    project: '',
    amount: 0,
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  const handleAddInvoice = () => {
    const { id: _, ...invoiceData } = newInvoice as Invoice;
    const invoice: Invoice = {
      id: `INV-2024-${String(invoices.length + 1).padStart(4, '0')}`,
      ...invoiceData,
    };
    setInvoices([...invoices, invoice]);
    setIsAddDialogOpen(false);
    toast.success('Invoice created successfully');
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(invoices.filter(i => i.id !== invoiceId));
    toast.success('Invoice deleted successfully');
  };

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(invoices.map(i => i.id === invoiceId ? { ...i, status: 'sent' as const } : i));
    toast.success('Invoice sent to client');
  };

  const handleMarkPaid = (invoiceId: string) => {
    setInvoices(invoices.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const } : i));
    toast.success('Invoice marked as paid');
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
            <span className="text-[#A9AFB8] text-sm">Total Revenue</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Pending</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${pendingAmount.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[#A9AFB8] text-sm">Overdue</span>
          </div>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${overdueAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
            <input
              type="text"
              placeholder="Search invoices..."
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
            <option value="paid" className="bg-[#0B0C0F]">Paid</option>
            <option value="overdue" className="bg-[#0B0C0F]">Overdue</option>
          </select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#111318] border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#F6F7F9] font-display">Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Client</label>
                <input
                  type="text"
                  value={newInvoice.client}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Project</label>
                <input
                  type="text"
                  value={newInvoice.project}
                  onChange={(e) => setNewInvoice({ ...newInvoice, project: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  placeholder="Project name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Amount</label>
                  <input
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                  />
                </div>
              </div>
              <button
                onClick={handleAddInvoice}
                className="w-full btn-primary py-3 mt-4"
              >
                Create Invoice
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Invoice</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Due Date</th>
                <th className="text-right px-6 py-4 text-[#A9AFB8] text-xs font-mono uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#F2C94C]" />
                      <div>
                        <p className="text-[#F6F7F9] font-medium text-sm">{invoice.id}</p>
                        <p className="text-[#6A6D75] text-xs">{invoice.project}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#A9AFB8] text-sm">{invoice.client}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                      {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                      {invoice.status === 'sent' && <Clock className="w-3 h-3" />}
                      {invoice.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                      {statusLabels[invoice.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#F6F7F9] text-sm font-medium">${invoice.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#A9AFB8] text-sm">{invoice.dueDate}</p>
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
                        {invoice.status === 'draft' && (
                          <DropdownMenuItem 
                            className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer"
                            onClick={() => handleSendInvoice(invoice.id)}
                          >
                            <Send className="w-4 h-4 mr-2" /> Send
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <DropdownMenuItem 
                            className="text-green-400 focus:bg-green-500/10 cursor-pointer"
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                          onClick={() => handleDeleteInvoice(invoice.id)}
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
