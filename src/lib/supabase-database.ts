import { supabase } from './supabase';
import type { Database, Project, Invoice, User, WorkOrder, Contract, DashboardAnalytics, Lead } from './database';

// Helper to map snake_case DB to camelCase Frontend
const mapProjectFromDB = (p: any): Project => ({
    ...p,
    clientId: p.client_id,
    assignedElectricians: p.assigned_electricians || [],
    assignedSubcontractors: p.assigned_subcontractors || [],
    workOrders: p.work_orders ? p.work_orders.map(mapWorkOrderFromDB) : [],
    estimatedValue: p.estimated_value || 0,
    actualValue: p.actual_value || 0,
    progress: p.progress || 0,
    priority: p.priority || 'medium',
    startDate: p.start_date || null,
    estimatedEndDate: p.end_date || null,
    actualEndDate: p.end_date || null,
    projectManagerId: p.project_manager_id || null,
    // Ensure strict types for arrays if DB returns null
    materials: p.materials || [],
    timeEntries: p.time_entries || [],
    photos: p.photos || [],
    notes: p.notes || [],
    createdAt: p.created_at,
    updatedAt: p.updated_at
});

const mapWorkOrderFromDB = (w: any): WorkOrder => ({
    ...w,
    projectId: w.project_id,
    assignedTo: w.assigned_to,
    dueDate: w.due_date,
    completedDate: w.completed_date,
});

const mapInvoiceFromDB = (i: any): Invoice => ({
    ...i,
    projectId: i.project_id,
    clientId: i.client_id,
    dueDate: i.due_date,
    paidDate: i.paid_date,
    subtotal: i.amount || 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: i.amount || 0,
    amountPaid: i.status === 'paid' ? (i.amount || 0) : 0,
    balanceDue: i.status === 'paid' ? 0 : (i.amount || 0),
    invoiceNumber: `INV-${new Date(i.created_at || Date.now()).getFullYear()}-${i.id?.split('-')[0] || '100'}`,
    status: i.status || 'draft',
    items: [{ description: 'Total Services Rendered', quantity: 1, unit: 'ea', unitPrice: i.amount || 0, total: i.amount || 0, category: 'labor' }],
    createdAt: i.created_at || new Date().toISOString(),
    updatedAt: i.updated_at || new Date().toISOString()
});

const mapUserFromDB = (u: any): User => ({
    ...u,
    hourlyRate: u.hourly_rate,
    isActive: u.is_active,
    lastLogin: u.last_login,
    createdAt: u.created_at,
});

const mapContractFromDB = (c: any): Contract => ({
    ...c,
    clientId: c.client_id,
    projectId: c.project_id,
    contractNumber: c.contract_number,
    totalValue: c.total_value,
    paymentTerms: c.payment_terms,
    depositAmount: c.deposit_amount,
    depositPaid: c.deposit_paid,
    scopeOfWork: c.scope_of_work,
    startDate: c.start_date,
    estimatedCompletion: c.estimated_completion,
    statementsOfWork: c.statements_of_work || [],
    clientSigned: c.client_signed,
    clientSignedAt: c.client_signed_at,
    companySigned: c.company_signed,
    companySignedAt: c.company_signed_at,
    createdBy: c.created_by,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
});

export const db: Database = {
    // Initialization
    init: () => { },

    // Users
    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data.map(mapUserFromDB);
    },

    getUserByEmail: async (email: string): Promise<User | undefined> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();
        if (error) return undefined;
        return mapUserFromDB(data);
    },

    getUserById: async (id: string): Promise<User | undefined> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return undefined;
        return mapUserFromDB(data);
    },

    saveUser: async (user: Partial<User>): Promise<void> => {
        const dbUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hourly_rate: (user as any).hourlyRate, // map back
            // other fields...
        };
        // If ID exists, upsert
        const { error } = await supabase.from('profiles').upsert(dbUser);
        if (error) throw error;
    },

    // Projects
    getProjects: async (): Promise<Project[]> => {
        const { data, error } = await supabase
            .from('projects')
            .select(`*`)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('getProjects error:', error);
            return [];
        }
        return data.map(mapProjectFromDB);
    },

    getProjectById: async (id: string): Promise<Project | undefined> => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        work_orders(*)
      `)
            .eq('id', id)
            .single();

        if (error) return undefined;
        return mapProjectFromDB(data);
    },

    getProjectsByClient: async (clientId: string): Promise<Project[]> => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        work_orders(*)
      `)
            .eq('client_id', clientId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data.map(mapProjectFromDB);
    },

    getProjectsByWorker: async (workerId: string): Promise<Project[]> => {
        // Using Postgres array containment operator logic via explicit filter or RLS
        // Since RLS already filters for workers, we can technically just call getProjects() if the user is the worker.
        // But to be explicit for admin viewing a worker's projects:
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        work_orders(*)
      `)
            .or(`assigned_electricians.cs.{${workerId}},assigned_subcontractors.cs.{${workerId}}`);

        if (error) throw error;
        return data.map(mapProjectFromDB);
    },

    saveProject: async (project: Partial<Project> & { id?: string }): Promise<void> => {
        // Map to DB shape
        const dbProject = {
            ...(project.id ? { id: project.id } : {}),
            client_id: project.clientId,
            name: project.name,
            description: project.description,
            status: project.status,
            address: project.address,
            estimated_value: project.estimatedValue,
            assigned_electricians: project.assignedElectricians,
            assigned_subcontractors: project.assignedSubcontractors,
            start_date: project.startDate,
            end_date: project.actualEndDate || project.estimatedEndDate,
            created_at: project.createdAt,
            updated_at: project.updatedAt
        };

        const { error } = await supabase.from('projects').upsert(dbProject);
        if (error) {
            console.error('Failed to save project:', error);
            throw error;
        }
    },

    deleteProject: async (id: string): Promise<void> => {
        await supabase.from('projects').delete().eq('id', id);
    },

    // Invoices
    getInvoices: async (): Promise<Invoice[]> => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapInvoiceFromDB);
    },

    getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return undefined;
        return mapInvoiceFromDB(data);
    },

    getInvoicesByProject: async (projectId: string): Promise<Invoice[]> => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('project_id', projectId);
        if (error) throw error;
        return data.map(mapInvoiceFromDB);
    },

    getInvoicesByClient: async (clientId: string): Promise<Invoice[]> => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('client_id', clientId);
        if (error) throw error;
        return data.map(mapInvoiceFromDB);
    },

    saveInvoice: async (invoice: Partial<Invoice> & { id?: string }): Promise<void> => {
        const dbInvoice = {
            ...(invoice.id ? { id: invoice.id } : {}),
            project_id: invoice.projectId,
            client_id: invoice.clientId,
            amount: invoice.total,
            status: invoice.status,
            due_date: invoice.dueDate,
            created_at: invoice.createdAt,
            updated_at: invoice.updatedAt
        };

        const { error } = await supabase.from('invoices').upsert(dbInvoice);
        if (error) throw error;
    },

    // Contracts
    getContracts: async (): Promise<Contract[]> => {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('getContracts error:', error);
            return [];
        }
        return data.map(mapContractFromDB);
    },

    getContractById: async (id: string): Promise<Contract | undefined> => {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return mapContractFromDB(data);
    },

    getContractsByClient: async (clientId: string): Promise<Contract[]> => {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapContractFromDB);
    },

    saveContract: async (contract: Contract): Promise<void> => {
        const dbContract = {
            id: contract.id,
            client_id: contract.clientId,
            project_id: contract.projectId,
            contract_number: contract.contractNumber,
            title: contract.title,
            status: contract.status,
            total_value: contract.totalValue,
            payment_terms: contract.paymentTerms,
            deposit_amount: contract.depositAmount,
            deposit_paid: contract.depositPaid,
            scope_of_work: contract.scopeOfWork,
            exclusions: contract.exclusions,
            start_date: contract.startDate,
            estimated_completion: contract.estimatedCompletion,
            statements_of_work: contract.statementsOfWork,
            client_signed: contract.clientSigned,
            client_signed_at: contract.clientSignedAt,
            company_signed: contract.companySigned,
            company_signed_at: contract.companySignedAt,
            created_by: contract.createdBy,
        };

        const { error } = await supabase.from('contracts').upsert(dbContract);
        if (error) throw error;
    },

    // Leads
    saveLead: async (lead: Partial<Lead>): Promise<void> => {
        try {
            // Priority 1: Route through the Edge Function to handle emails and user creation securely
            const { error: edgeError, data } = await supabase.functions.invoke('process-contact-request', {
                body: lead
            });

            if (edgeError) {
                console.warn('Edge function failed or not deployed. Falling back to direct database insertion.', edgeError);
                throw edgeError;
            }

            if (data?.error) {
                console.warn('Edge function payload error. Falling back.', data.error);
                throw new Error(data.error);
            }
        } catch (err) {
            // Priority 2: Fallback to direct insert for local environments without Deno / Functions deployed
            const dbLead = {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                address: lead.address,
                service_type: lead.serviceType,
                complexity: lead.complexity,
                description: lead.description,
                preferred_time: lead.preferredTime,
                status: lead.status || 'new'
            };
            const { error } = await supabase.from('leads').insert(dbLead);
            if (error) throw error;
        }
    },

    getClientRequests: async (email: string): Promise<Lead[]> => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(l => ({
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            address: l.address,
            serviceType: l.service_type,
            complexity: l.complexity,
            description: l.description,
            preferredTime: l.preferred_time,
            status: l.status,
            createdAt: l.created_at,
            updatedAt: l.updated_at
        }));
    },
    getLeadsByEmail: async (email: string): Promise<Lead[]> => {
        return db.getClientRequests(email);
    },

    getLeads: async (): Promise<Lead[]> => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('getLeads error:', error);
            return [];
        }

        return data.map((l: any) => ({
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            address: l.address,
            serviceType: l.service_type,
            complexity: l.complexity,
            description: l.description,
            preferredTime: l.preferred_time,
            status: l.status,
            createdAt: l.created_at,
            updatedAt: l.updated_at
        }));
    },

    updateLeadStatus: async (id: string, status: string): Promise<void> => {
        const { error } = await supabase.from('leads').update({ status }).eq('id', id);
        if (error) throw error;
    },
};

// Analytics helper
export const computeAnalytics = (projects: Project[], invoices: Invoice[], users: User[]): DashboardAnalytics => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(thisYear, thisMonth - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'short' });
        revenueByMonth.push({ month: monthKey, revenue: 0, expenses: 0 });
    }

    invoices.forEach(inv => {
        const invDate = new Date(inv.issueDate);
        const monthIndex = revenueByMonth.findIndex(m => m.month === invDate.toLocaleString('default', { month: 'short' }));
        if (monthIndex >= 0 && inv.status === 'paid') {
            revenueByMonth[monthIndex].revenue += inv.total;
        }
    });

    // Top clients
    const clients = users.filter(u => u.role === 'client') as any[];
    const topClients = clients
        .map(client => ({
            clientId: client.id,
            name: client.name,
            totalSpent: client.totalSpent || 0,
            projects: client.projects?.length || 0,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

    // Top workers
    const workers = users.filter(u => u.role === 'employee' || u.role === 'subcontractor') as any[];
    const topWorkers = workers
        .map(worker => ({
            workerId: worker.id,
            name: worker.name,
            projects: worker.completedProjects || worker.assignedProjects?.length || 0,
            rating: worker.rating || 0,
            revenue: Math.floor(Math.random() * 50000) + 10000, // Simulated
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in-progress').length,
        completedProjectsThisMonth: projects.filter(p => {
            if (!p.actualEndDate) return false;
            const endDate = new Date(p.actualEndDate);
            return endDate.getMonth() === thisMonth && endDate.getFullYear() === thisYear && p.status === 'completed';
        }).length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
        revenueThisMonth: invoices.filter(i => {
            const invDate = new Date(i.issueDate);
            return invDate.getMonth() === thisMonth && invDate.getFullYear() === thisYear && i.status === 'paid';
        }).reduce((sum, i) => sum + i.total, 0),
        outstandingInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'viewed').reduce((sum, i) => sum + i.balanceDue, 0),
        overdueInvoices: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.balanceDue, 0),
        projectsByStatus: {
            lead: projects.filter(p => p.status === 'lead').length,
            quoted: projects.filter(p => p.status === 'quoted').length,
            contracted: projects.filter(p => p.status === 'contracted').length,
            'in-progress': projects.filter(p => p.status === 'in-progress').length,
            inspection: projects.filter(p => p.status === 'inspection').length,
            completed: projects.filter(p => p.status === 'completed').length,
            cancelled: projects.filter(p => p.status === 'cancelled').length,
        },
        revenueByMonth,
        topClients,
        topWorkers,
        projectsByLocation: [], // Would calculate from project addresses
        averageProjectDuration: 45, // Simulated
        onTimeCompletionRate: 85, // Simulated percentage
        averageInvoicePaymentTime: 12, // Simulated days
    };
};
