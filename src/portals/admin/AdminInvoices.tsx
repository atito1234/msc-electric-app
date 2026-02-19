import { useState, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Download, 
  Send, 
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Sparkles,
  Mail
} from 'lucide-react';
import type { Invoice, InvoiceStatus, Project } from '@/lib/database';
import { db } from '@/lib/database';
import { generateInvoiceWithAI } from '@/lib/ai-service';
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

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400', icon: Mail },
  viewed: { label: 'Viewed', color: 'bg-purple-500/20 text-purple-400', icon: Eye },
  paid: { label: 'Paid', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-400', icon: FileText },
};

export function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    clientId: '',
    projectId: '',
    items: [],
    subtotal: 0,
    taxRate: 0.0825,
    taxAmount: 0,
    discount: 0,
    total: 0,
    balanceDue: 0,
    status: 'draft',
    notes: '',
    terms: 'Net 15',
    aiGenerated: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInvoices(db.getInvoices());
    setProjects(db.getProjects());
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.clientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'viewed').reduce((sum, i) => sum + i.balanceDue, 0);
  const overdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.balanceDue, 0);

  const handleGenerateAIInvoice = () => {
    if (!newInvoice.projectId) {
      toast.error('Please select a project first');
      return;
    }
    
    const project = projects.find(p => p.id === newInvoice.projectId);
    if (!project) return;
    
    const suggestion = generateInvoiceWithAI(
      project,
      project.workOrders,
      project.timeEntries,
      project.materials,
      newInvoice.taxRate || 0.0825
    );
    
    setAiSuggestion(suggestion);
    setNewInvoice({
      ...newInvoice,
      items: suggestion.items,
      subtotal: suggestion.subtotal,
      taxAmount: suggestion.taxAmount,
      total: suggestion.total,
      balanceDue: suggestion.total,
      aiGenerated: true,
    });
    toast.success('AI invoice generated with ' + Math.round(suggestion.confidence * 100) + '% confidence');
  };

  const handleCreateInvoice = () => {
    const { id: _, ...invoiceData } = newInvoice as Invoice;
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      ...invoiceData,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amountPaid: 0,
      createdBy: 'user-admin-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    db.saveInvoice(invoice);
    setInvoices([...invoices, invoice]);
    setIsAddDialogOpen(false);
    toast.success('Invoice created successfully');
  };

  const handleSendInvoice = (invoice: Invoice) => {
    const updated = { ...invoice, status: 'sent' as InvoiceStatus, sentAt: new Date().toISOString() };
    db.saveInvoice(updated);
    setInvoices(invoices.map(i => i.id === invoice.id ? updated : i));
    toast.success('Invoice sent to client');
  };

  const handleMarkPaid = (invoice: Invoice) => {
    const updated = { 
      ...invoice, 
      status: 'paid' as InvoiceStatus, 
      paidDate: new Date().toISOString().split('T')[0],
      amountPaid: invoice.total,
      balanceDue: 0,
    };
    db.saveInvoice(updated);
    setInvoices(invoices.map(i => i.id === invoice.id ? updated : i));
    toast.success('Invoice marked as paid');
  };

  const getClientName = (clientId: string) => {
    const client = db.getUserById(clientId);
    return client?.name || clientId;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Outstanding</p>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${outstanding.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Overdue</p>
          <p className="text-red-400 text-2xl font-display font-bold">${overdue.toLocaleString()}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">Invoices</h2>
          <p className="text-[#A9AFB8]">Manage invoices and track payments</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Generate Invoice
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#111318] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#F6F7F9] font-display">Generate AI Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Project</label>
                <select
                  value={newInvoice.projectId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, projectId: e.target.value, clientId: projects.find(p => p.id === e.target.value)?.clientId || '' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              {newInvoice.projectId && (
                <button
                  onClick={handleGenerateAIInvoice}
                  className="w-full py-3 bg-[#F2C94C]/20 border border-[#F2C94C]/50 rounded-lg text-[#F2C94C] flex items-center justify-center gap-2 hover:bg-[#F2C94C]/30 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Project & Generate Invoice
                </button>
              )}
              
              {aiSuggestion && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F2C94C]/10 rounded-lg">
                    <p className="text-[#F2C94C] text-sm font-medium mb-1">AI Suggestion</p>
                    <p className="text-[#A9AFB8] text-xs">{aiSuggestion.reasoning}</p>
                    <p className="text-[#6A6D75] text-xs mt-2">Confidence: {Math.round(aiSuggestion.confidence * 100)}%</p>
                  </div>
                  
                  <div>
                    <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Line Items</label>
                    <div className="space-y-2">
                      {aiSuggestion.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-[#F6F7F9] text-sm">{item.description}</p>
                            <p className="text-[#6A6D75] text-xs">{item.quantity} {item.unit} × ${item.unitPrice}</p>
                          </div>
                          <p className="text-[#F6F7F9] font-medium">${item.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Subtotal</label>
                      <p className="text-[#F6F7F9]">${aiSuggestion.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Tax (8.25%)</label>
                      <p className="text-[#F6F7F9]">${aiSuggestion.taxAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F6F7F9] font-medium">Total</span>
                      <span className="text-[#F2C94C] text-xl font-display font-bold">${aiSuggestion.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCreateInvoice}
                    className="w-full btn-primary py-3"
                  >
                    Create Invoice
                  </button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            <option key={status} value={status}>{config.label}</option>
          ))}
        </select>
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
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusConfig[invoice.status].icon;
                return (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#F2C94C]" />
                        <div>
                          <p className="text-[#F6F7F9] font-medium text-sm">{invoice.invoiceNumber}</p>
                          <p className="text-[#6A6D75] text-xs">{getProjectName(invoice.projectId)}</p>
                          {invoice.aiGenerated && (
                            <span className="text-[10px] text-[#F2C94C] bg-[#F2C94C]/10 px-1.5 py-0.5 rounded">AI</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#A9AFB8] text-sm">{getClientName(invoice.clientId)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[invoice.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[invoice.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#F6F7F9] text-sm font-medium">${invoice.total.toLocaleString()}</p>
                      {invoice.balanceDue > 0 && (
                        <p className="text-[#6A6D75] text-xs">${invoice.balanceDue.toLocaleString()} due</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${invoice.status === 'overdue' ? 'text-red-400' : 'text-[#A9AFB8]'}`}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 text-[#6A6D75] hover:text-[#F6F7F9] transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#111318] border-white/10">
                          <DropdownMenuItem 
                            className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer"
                            onClick={() => { setSelectedInvoice(invoice); setIsViewDialogOpen(true); }}
                          >
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem 
                              className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer"
                              onClick={() => handleSendInvoice(invoice)}
                            >
                              <Send className="w-4 h-4 mr-2" /> Send to Client
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                            <DropdownMenuItem 
                              className="text-green-400 focus:bg-green-500/10 cursor-pointer"
                              onClick={() => handleMarkPaid(invoice)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[#111318] border-white/10 max-w-2xl">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#F6F7F9] font-display flex items-center gap-3">
                  {selectedInvoice.invoiceNumber}
                  {selectedInvoice.aiGenerated && (
                    <span className="text-xs text-[#F2C94C] bg-[#F2C94C]/10 px-2 py-1 rounded">AI Generated</span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#6A6D75] text-xs">Bill To</p>
                    <p className="text-[#F6F7F9] font-medium">{getClientName(selectedInvoice.clientId)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedInvoice.status].color}`}>
                      {statusConfig[selectedInvoice.status].label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[#6A6D75] text-xs">Issue Date</p>
                    <p className="text-[#F6F7F9]">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#6A6D75] text-xs">Due Date</p>
                    <p className="text-[#F6F7F9]">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#6A6D75] text-xs">Terms</p>
                    <p className="text-[#F6F7F9]">{selectedInvoice.terms}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-3">Line Items</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-[#F6F7F9] text-sm">{item.description}</p>
                          <p className="text-[#6A6D75] text-xs">{item.quantity} {item.unit} × ${item.unitPrice}</p>
                        </div>
                        <p className="text-[#F6F7F9] font-medium">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9AFB8]">Subtotal</span>
                    <span className="text-[#F6F7F9]">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A9AFB8]">Tax ({(selectedInvoice.taxRate * 100).toFixed(2)}%)</span>
                    <span className="text-[#F6F7F9]">${selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A9AFB8]">Discount</span>
                      <span className="text-green-400">-${selectedInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-medium pt-2 border-t border-white/10">
                    <span className="text-[#F6F7F9]">Total</span>
                    <span className="text-[#F2C94C]">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.amountPaid > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A9AFB8]">Amount Paid</span>
                      <span className="text-green-400">${selectedInvoice.amountPaid.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedInvoice.balanceDue > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A9AFB8]">Balance Due</span>
                      <span className="text-red-400">${selectedInvoice.balanceDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <p className="text-[#6A6D75] text-xs mb-1">Notes</p>
                    <p className="text-[#A9AFB8] text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
