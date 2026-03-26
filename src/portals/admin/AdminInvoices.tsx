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
  Mail,
  Zap,
  Trash2,
  Clock
} from 'lucide-react';
import type { Invoice, InvoiceStatus, Project } from '@/lib/database';
import { db } from '@/lib/supabase-database';
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

// Define the company information
const COMPANY_INFO = {
  name: 'MSC Electric',
  email: 'admin@mscelectric.io',
  phone: '(512) 555-0199',
  address: '123 Main St, Austin, TX 78701',
  website: 'www.mscelectric.io'
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
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
  const [clients, setClients] = useState<any[]>([]);
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

  const loadData = async () => {
    setInvoices(await db.getInvoices());
    setProjects(await db.getProjects());
    setClients(await db.getUsers());
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

  const handleUpdateTotals = (newItems: any[]) => {
    if (!aiSuggestion) return;
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const newTaxAmount = newSubtotal * (newInvoice.taxRate || 0.0825);
    const newTotal = newSubtotal + newTaxAmount;

    setAiSuggestion({
      ...aiSuggestion,
      items: newItems,
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      total: newTotal
    });

    setNewInvoice({
      ...newInvoice,
      items: newItems,
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      total: newTotal,
      balanceDue: newTotal
    });
  };

  const handleUpdateItem = (idx: number, field: string, value: any) => {
    if (!aiSuggestion) return;
    const newItems = [...aiSuggestion.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
    handleUpdateTotals(newItems);
  };

  const handleAddItem = () => {
    if (!aiSuggestion) return;
    const newItems = [...aiSuggestion.items, { description: 'New Item', quantity: 1, unit: 'ea', unitPrice: 0, total: 0, category: 'labor' }];
    handleUpdateTotals(newItems);
  };

  const handleRemoveItem = (idx: number) => {
    if (!aiSuggestion) return;
    const newItems = aiSuggestion.items.filter((_: any, i: number) => i !== idx);
    handleUpdateTotals(newItems);
  };

  const handleCreateInvoice = async () => {
    const { id: _, ...invoiceData } = newInvoice as Invoice;
    const invoice: Partial<Invoice> = {
      ...invoiceData,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amountPaid: 0,
      createdBy: 'user-admin-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.saveInvoice(invoice);
      await loadData();
      setIsAddDialogOpen(false);
      toast.success('Invoice created successfully');
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Failed to create invoice.');
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    const updated = { ...invoice, status: 'sent' as InvoiceStatus, sentAt: new Date().toISOString() };
    await db.saveInvoice(updated);
    setInvoices(invoices.map(i => i.id === invoice.id ? updated : i));
    toast.success('Invoice sent to client');
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    const updated = {
      ...invoice,
      status: 'paid' as InvoiceStatus,
      paidDate: new Date().toISOString().split('T')[0],
      amountPaid: invoice.total,
      balanceDue: 0,
    };
    await db.saveInvoice(updated);
    setInvoices(invoices.map(i => i.id === invoice.id ? updated : i));
    toast.success('Invoice marked as paid');
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || clientId;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  const handleDownloadPDF = async () => {
    if (!selectedInvoice) return;
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const opt: any = {
        margin: 0.5,
        filename: `${selectedInvoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
      toast.success('Invoice PDF is downloading');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const exportToCSV = () => {
    if (invoices.length === 0) {
      toast.error('No invoices to export');
      return;
    }

    const headers = ['Invoice Number', 'Client', 'Project', 'Issue Date', 'Due Date', 'Status', 'Total', 'Balance Due'];
    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => {
        return [
          inv.invoiceNumber,
          `"${getClientName(inv.clientId)}"`,
          `"${getProjectName(inv.projectId)}"`,
          inv.issueDate,
          inv.dueDate,
          inv.status,
          inv.total,
          inv.balanceDue
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Spreadsheet exported successfully');
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

        <div className="flex gap-2">
          <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 bg-white/5 hover:bg-white/10 text-[#F6F7F9] px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
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
                      <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Line Items (Editable)</label>
                      <div className="space-y-3">
                        {aiSuggestion.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-white/5 rounded-lg gap-3">
                            <div className="flex-1 w-full space-y-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                                className="w-full bg-[#0B0C0F] border border-white/10 rounded px-2 py-1 text-sm text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                                  className="w-20 bg-[#0B0C0F] border border-white/10 rounded px-2 py-1 text-xs text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                                />
                                <span className="text-[#6A6D75] text-xs">× $</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                                  className="w-24 bg-[#0B0C0F] border border-white/10 rounded px-2 py-1 text-xs text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C]"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                              <p className="text-[#F6F7F9] font-medium min-w-[4rem] text-right">${item.total.toFixed(2)}</p>
                              <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button onClick={handleAddItem} className="text-xs text-[#F2C94C] hover:underline mt-2 flex items-center gap-1">
                          + Add Line Item
                        </button>
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
                const config = statusConfig[invoice.status] || { label: invoice.status, color: 'bg-gray-500/20 text-gray-400', icon: Clock };
                const StatusIcon = config.icon;
                return (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setSelectedInvoice(invoice)}>
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
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
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
                          <DropdownMenuItem
                            className="text-[#F6F7F9] focus:bg-white/10 cursor-pointer"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              // Use a slight delay to allow the dialog to open and render the printable element
                              setTimeout(() => {
                                setIsViewDialogOpen(true);
                                setTimeout(handleDownloadPDF, 100);
                              }, 0);
                            }}
                          >
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
        <DialogContent className="bg-[#111318] border-white/10 max-w-3xl overflow-y-auto max-h-[90vh]">
          {selectedInvoice && (
            <>
              <DialogHeader className="flex flex-row justify-between items-center mr-8">
                <DialogTitle className="text-[#F6F7F9] font-display flex items-center gap-3">
                  {selectedInvoice.invoiceNumber}
                  {selectedInvoice.aiGenerated && (
                    <span className="text-xs text-[#F2C94C] bg-[#F2C94C]/10 px-2 py-1 rounded">AI Generated</span>
                  )}
                </DialogTitle>
                <button
                  onClick={handleDownloadPDF}
                  className="btn-primary py-2 px-4 shadow-xl flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </DialogHeader>

              {/* Printable Wrapper */}
              <div id="printable-invoice" className="bg-[#1a1d24] p-8 rounded-lg mt-4 text-[#F6F7F9]">

                {/* Invoice Header: Company Info & Logo */}
                <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#F2C94C]/20 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-[#F2C94C]" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">{COMPANY_INFO.name}</h2>
                      <p className="text-[#A9AFB8] text-sm">{COMPANY_INFO.address}</p>
                      <p className="text-[#A9AFB8] text-sm">{COMPANY_INFO.email} • {COMPANY_INFO.phone}</p>
                      <p className="text-[#A9AFB8] text-sm">{COMPANY_INFO.website}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-display font-bold text-[#F2C94C] uppercase tracking-wider mb-2">Invoice</h1>
                    <p className="text-[#A9AFB8] font-mono">{selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[#6A6D75] text-xs">Bill To</p>
                    <p className="text-[#F6F7F9] font-medium">{getClientName(selectedInvoice.clientId)}</p>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const config = statusConfig[selectedInvoice.status] || { label: selectedInvoice.status, color: 'bg-gray-500/20 text-gray-400', icon: Clock };
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      );
                    })()}
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

                <div className="border-t border-white/10 pt-4 space-y-2 mb-8">
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
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-red-400">Balance Due</span>
                      <span className="text-red-400">${selectedInvoice.balanceDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {selectedInvoice.notes && (
                  <div className="mb-6">
                    <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-[#A9AFB8] text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/10 text-center text-[#6A6D75] text-xs">
                  Thank you for your business! If you have any questions regarding this invoice, please contact us.
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
