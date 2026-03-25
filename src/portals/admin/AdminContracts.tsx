import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Send, CheckCircle, Eye, Download, PenTool } from 'lucide-react';
import type { Contract, ContractStatus } from '@/lib/database';
import { db } from '@/lib/supabase-database';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusConfig: Record<ContractStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
  sent: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400' },
  signed: { label: 'Signed', color: 'bg-purple-500/20 text-purple-400' },
  active: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
  completed: { label: 'Completed', color: 'bg-[#F2C94C]/20 text-[#F2C94C]' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
};

export function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setContracts(await db.getContracts());
      setClients(await db.getUsers());
    };
    loadData();
  }, []);

  const filteredContracts = contracts.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = contracts.filter(c => c.status === 'active' || c.status === 'completed').reduce((sum, c) => sum + c.totalValue, 0);
  const activeCount = contracts.filter(c => c.status === 'active').length;
  const pendingSignatures = contracts.filter(c => c.status === 'sent').length;

  const handleSend = async (contract: Contract) => {
    const updated = { ...contract, status: 'sent' as ContractStatus };
    await db.saveContract(updated);
    setContracts(contracts.map(c => c.id === contract.id ? updated : c));
    toast.success('Contract sent for signature');
  };

  const handleSign = async (contract: Contract) => {
    const updated = {
      ...contract,
      status: 'active' as ContractStatus,
      companySigned: true,
      companySignedAt: new Date().toISOString(),
      clientSigned: true,
      clientSignedAt: new Date().toISOString(),
    };
    await db.saveContract(updated);
    setContracts(contracts.map(c => c.id === contract.id ? updated : c));
    toast.success('Contract signed and activated');
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || clientId;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Active Contracts</p>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">{activeCount}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-[#F6F7F9] text-2xl font-display font-bold">${(totalValue / 1000).toFixed(0)}k</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#6A6D75] text-xs font-mono uppercase tracking-wider mb-1">Pending Signatures</p>
          <p className="text-blue-400 text-2xl font-display font-bold">{pendingSignatures}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">Contracts</h2>
          <p className="text-[#A9AFB8]">Manage service agreements and contracts</p>
        </div>
        <button
          onClick={() => toast.info('Create Contract - Coming Soon')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6D75]" />
        <input
          type="text"
          placeholder="Search contracts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C]"
        />
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContracts.map((contract) => (
          <div key={contract.id} className="glass-card rounded-xl p-5 hover:border-[#F2C94C]/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#F2C94C]" />
                </div>
                <div>
                  <p className="text-[#F6F7F9] font-medium text-sm">{contract.title}</p>
                  <p className="text-[#6A6D75] text-xs">{contract.contractNumber}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[contract.status].color}`}>
                {statusConfig[contract.status].label}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#A9AFB8]">Client</span>
                <span className="text-[#F6F7F9]">{getClientName(contract.clientId)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A9AFB8]">Value</span>
                <span className="text-[#F6F7F9] font-medium">${contract.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A9AFB8]">Payment Terms</span>
                <span className="text-[#F6F7F9]">{contract.paymentTerms}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedContract(contract); setIsViewOpen(true); }}
                className="flex-1 py-2 bg-white/5 rounded-lg text-sm text-[#F6F7F9] hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> View
              </button>
              {contract.status === 'draft' && (
                <button
                  onClick={() => handleSend(contract)}
                  className="flex-1 py-2 bg-blue-500/20 rounded-lg text-sm text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              )}
              {contract.status === 'sent' && (
                <button
                  onClick={() => handleSign(contract)}
                  className="flex-1 py-2 bg-green-500/20 rounded-lg text-sm text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <PenTool className="w-4 h-4" /> Sign
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-[#111318] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedContract && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#F6F7F9] font-display">{selectedContract.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedContract.status].color}`}>
                    {statusConfig[selectedContract.status].label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-[#6A6D75] text-xs mb-1">Contract Value</p>
                    <p className="text-[#F6F7F9] text-xl font-display font-bold">${selectedContract.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-[#6A6D75] text-xs mb-1">Deposit</p>
                    <p className="text-[#F6F7F9] text-xl font-display font-bold">${selectedContract.depositAmount.toLocaleString()}</p>
                    <p className="text-xs text-green-400">{selectedContract.depositPaid ? 'Paid' : 'Pending'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Scope of Work</h4>
                  <p className="text-[#F6F7F9] text-sm">{selectedContract.scopeOfWork}</p>
                </div>

                <div>
                  <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Payment Terms</h4>
                  <p className="text-[#F6F7F9] text-sm">{selectedContract.paymentTerms}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Company Signature</h4>
                    <p className="text-sm">{selectedContract.companySigned ? (
                      <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Signed on {new Date(selectedContract.companySignedAt!).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}</p>
                  </div>
                  <div>
                    <h4 className="text-[#A9AFB8] text-xs font-mono uppercase tracking-wider mb-2">Client Signature</h4>
                    <p className="text-sm">{selectedContract.clientSigned ? (
                      <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Signed on {new Date(selectedContract.clientSignedAt!).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-white/5 rounded-lg text-sm text-[#F6F7F9] hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
