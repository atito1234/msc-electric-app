// MSC Electric - Project Management Database Schema
// This simulates a backend database using localStorage for demo purposes

export type UserRole = 'admin' | 'client' | 'employee' | 'subcontractor' | 'gc';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Client extends User {
  role: 'client';
  companyName?: string;
  address: Address;
  projects: string[]; // Project IDs
  totalSpent: number;
  rating: number;
}

export interface Employee extends User {
  role: 'employee';
  title: string;
  hourlyRate: number;
  specialties: string[];
  certifications: string[];
  assignedProjects: string[];
  completedProjects: number;
  rating: number;
  availability: 'available' | 'busy' | 'off';
  location?: GeoLocation;
}

export interface Subcontractor extends User {
  role: 'subcontractor';
  companyName: string;
  businessLicense: string;
  insuranceExpiry: string;
  hourlyRate: number;
  specialties: string[];
  assignedProjects: string[];
  rating: number;
  availability: 'available' | 'busy' | 'unavailable';
  serviceArea: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  lastUpdated: string;
}

export type ProjectStatus = 'lead' | 'quoted' | 'contracted' | 'in-progress' | 'inspection' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  contractId?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  address: Address;
  estimatedValue: number;
  actualValue: number;
  startDate?: string;
  estimatedEndDate?: string;
  actualEndDate?: string;
  progress: number; // 0-100

  // Team
  projectManagerId?: string;
  assignedElectricians: string[]; // Employee IDs
  assignedSubcontractors: string[]; // Subcontractor IDs

  // Work tracking
  workOrders: WorkOrder[];
  materials: Material[];
  timeEntries: TimeEntry[];
  photos: ProjectPhoto[];
  notes: ProjectNote[];

  // Financial
  invoices: string[]; // Invoice IDs
  expenses: Expense[];

  // Timeline
  history: ProjectHistoryEntry[];

  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string[]; // Employee/Subcontractor IDs
  priority: ProjectPriority;
  estimatedHours: number;
  actualHours: number;
  materialsNeeded: string[];
  scheduledDate?: string;
  completedDate?: string;
  checklist: ChecklistItem[];
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface Material {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  supplier?: string;
  ordered: boolean;
  delivered: boolean;
  deliveredDate?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  workOrderId?: string;
  userId: string;
  date: string;
  hours: number;
  description: string;
  isBillable: boolean;
  hourlyRate: number;
}

export interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
  takenBy: string;
  takenAt: string;
  category: 'before' | 'during' | 'after' | 'issue' | 'inspection';
}

export interface ProjectNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  isPrivate: boolean; // Only visible to internal team
}

export interface ProjectHistoryEntry {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, any>;
}

export interface Expense {
  id: string;
  projectId: string;
  category: string;
  description: string;
  amount: number;
  receipt?: string;
  submittedBy: string;
  submittedAt: string;
  approved: boolean;
  approvedBy?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'archived';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  complexity?: string;
  description?: string;
  preferredTime?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  contractId?: string;
  statementOfWorkId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  // Line items
  items: InvoiceItem[];

  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;

  // Dates
  issueDate: string;
  dueDate: string;
  paidDate?: string;

  // Payment
  paymentMethod?: string;
  paymentNotes?: string;

  // AI Generation
  aiGenerated: boolean;
  aiPrompt?: string;

  notes: string;
  terms: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  category: 'labor' | 'materials' | 'equipment' | 'permits' | 'other';
}

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled';

export interface Contract {
  id: string;
  clientId: string;
  projectId?: string;
  contractNumber: string;
  title: string;
  status: ContractStatus;

  // Value
  totalValue: number;
  paymentTerms: string;
  depositAmount: number;
  depositPaid: boolean;

  // Scope
  scopeOfWork: string;
  exclusions: string;

  // Timeline
  startDate?: string;
  estimatedCompletion?: string;

  // Documents
  statementsOfWork: string[]; // SOW IDs

  // Signatures
  clientSigned: boolean;
  clientSignedAt?: string;
  clientSignature?: string;
  companySigned: boolean;
  companySignedAt?: string;
  companySignature?: string;

  // Files
  documentUrl?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatementOfWork {
  id: string;
  contractId: string;
  projectId: string;
  title: string;
  description: string;
  status: 'draft' | 'approved' | 'in-progress' | 'completed';

  // Work details
  tasks: SOWTask[];
  deliverables: Deliverable[];

  // Timeline
  startDate: string;
  endDate: string;
  milestones: Milestone[];

  // Budget
  estimatedCost: number;
  actualCost: number;

  // Team
  assignedWorkers: string[];

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOWTask {
  id: string;
  description: string;
  estimatedHours: number;
  actualHours: number;
  completed: boolean;
  completedAt?: string;
  assignedTo?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  approved: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  paymentAmount?: number;
  paymentReleased: boolean;
}

// Analytics Types
export interface DashboardAnalytics {
  // Overview
  totalProjects: number;
  activeProjects: number;
  completedProjectsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  outstandingInvoices: number;
  overdueInvoices: number;

  // Projects by status
  projectsByStatus: Record<ProjectStatus, number>;

  // Revenue by month
  revenueByMonth: { month: string; revenue: number; expenses: number }[];

  // Top clients
  topClients: { clientId: string; name: string; totalSpent: number; projects: number }[];

  // Worker performance
  topWorkers: { workerId: string; name: string; projects: number; rating: number; revenue: number }[];

  // Geographic distribution
  projectsByLocation: { state: string; count: number; revenue: number }[];

  // Efficiency metrics
  averageProjectDuration: number; // days
  onTimeCompletionRate: number; // percentage
  averageInvoicePaymentTime: number; // days
}

// Initialize mock data
const initializeDatabase = () => {
  if (typeof window === 'undefined') return;

  // Check if already initialized
  if (localStorage.getItem('msc_db_initialized')) return;

  // Create mock users
  const users: User[] = [
    // Admin
    {
      id: 'user-admin-1',
      email: 'admin@mscelectric.io',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      phone: '(555) 000-0001',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    // Clients
    {
      id: 'user-client-1',
      email: 'johnson@email.com',
      password: 'client123',
      name: 'Michael Johnson',
      role: 'client',
      phone: '(555) 111-1111',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'user-client-2',
      email: 'smith@email.com',
      password: 'client123',
      name: 'Sarah Smith',
      role: 'client',
      phone: '(555) 222-2222',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    // Employees
    {
      id: 'user-emp-1',
      email: 'carlos@mscelectric.com',
      password: 'employee123',
      name: 'Carlos Martinez',
      role: 'employee',
      phone: '(555) 333-3333',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'user-emp-2',
      email: 'maria@mscelectric.com',
      password: 'employee123',
      name: 'Maria Garcia',
      role: 'employee',
      phone: '(555) 444-4444',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    // Subcontractors
    {
      id: 'user-sub-1',
      email: 'juan@jrelectric.com',
      password: 'sub123',
      name: 'Juan Rodriguez',
      role: 'subcontractor',
      phone: '(555) 555-5555',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ];

  localStorage.setItem('msc_users', JSON.stringify(users));
  localStorage.setItem('msc_db_initialized', 'true');
};

// Database operations
export const db = {
  init: initializeDatabase,

  // Users
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('msc_users') || '[]');
  },

  getUserByEmail: (email: string): User | undefined => {
    return db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById: (id: string): User | undefined => {
    return db.getUsers().find(u => u.id === id);
  },

  saveUser: (user: User): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('msc_users', JSON.stringify(users));
  },

  // Projects
  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('msc_projects') || '[]');
  },

  getProjectById: (id: string): Project | undefined => {
    return db.getProjects().find(p => p.id === id);
  },

  getProjectsByClient: (clientId: string): Project[] => {
    return db.getProjects().filter(p => p.clientId === clientId);
  },

  getProjectsByWorker: (workerId: string): Project[] => {
    return db.getProjects().filter(p =>
      p.assignedElectricians.includes(workerId) ||
      p.assignedSubcontractors.includes(workerId)
    );
  },

  saveProject: (project: Project): void => {
    const projects = db.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.push({
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem('msc_projects', JSON.stringify(projects));
  },

  deleteProject: (id: string): void => {
    const projects = db.getProjects().filter(p => p.id !== id);
    localStorage.setItem('msc_projects', JSON.stringify(projects));
  },

  // Invoices
  getInvoices: (): Invoice[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('msc_invoices') || '[]');
  },

  getInvoiceById: (id: string): Invoice | undefined => {
    return db.getInvoices().find(i => i.id === id);
  },

  getInvoicesByProject: (projectId: string): Invoice[] => {
    return db.getInvoices().filter(i => i.projectId === projectId);
  },

  getInvoicesByClient: (clientId: string): Invoice[] => {
    return db.getInvoices().filter(i => i.clientId === clientId);
  },

  saveInvoice: (invoice: Invoice): void => {
    const invoices = db.getInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      invoices[index] = { ...invoice, updatedAt: new Date().toISOString() };
    } else {
      invoices.push({
        ...invoice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem('msc_invoices', JSON.stringify(invoices));
  },

  // Contracts
  getContracts: (): Contract[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('msc_contracts') || '[]');
  },

  getContractById: (id: string): Contract | undefined => {
    return db.getContracts().find(c => c.id === id);
  },

  getContractsByClient: (clientId: string): Contract[] => {
    return db.getContracts().filter(c => c.clientId === clientId);
  },

  saveContract: (contract: Contract): void => {
    const contracts = db.getContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    if (index >= 0) {
      contracts[index] = { ...contract, updatedAt: new Date().toISOString() };
    } else {
      contracts.push({
        ...contract,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem('msc_contracts', JSON.stringify(contracts));
  },

  // Statements of Work
  getSOWs: (): StatementOfWork[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('msc_sows') || '[]');
  },

  getSOWById: (id: string): StatementOfWork | undefined => {
    return db.getSOWs().find(s => s.id === id);
  },

  getSOWsByContract: (contractId: string): StatementOfWork[] => {
    return db.getSOWs().filter(s => s.contractId === contractId);
  },

  saveSOW: (sow: StatementOfWork): void => {
    const sows = db.getSOWs();
    const index = sows.findIndex(s => s.id === sow.id);
    if (index >= 0) {
      sows[index] = { ...sow, updatedAt: new Date().toISOString() };
    } else {
      sows.push({
        ...sow,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem('msc_sows', JSON.stringify(sows));
  },

  // Clear all data (for testing)
  clearAll: (): void => {
    localStorage.removeItem('msc_users');
    localStorage.removeItem('msc_projects');
    localStorage.removeItem('msc_invoices');
    localStorage.removeItem('msc_contracts');
    localStorage.removeItem('msc_sows');
    localStorage.removeItem('msc_db_initialized');
  },
};

// Seed data with realistic examples
export const seedDatabase = () => {
  if (typeof window === 'undefined') return;

  // Clear existing
  db.clearAll();

  // Initialize with base users
  db.init();

  // Add more detailed users
  const users: any[] = [
    {
      id: 'user-admin-1',
      email: 'admin@mscelectric.io',
      password: 'admin123',
      name: 'Alexandra Torres',
      role: 'admin',
      phone: '(555) 000-0001',
      avatar: 'AT',
      createdAt: '2023-01-01T00:00:00Z',
      isActive: true,
    },
    {
      id: 'client-1',
      email: 'johnson.family@email.com',
      password: 'client123',
      name: 'Michael Johnson',
      role: 'client',
      phone: '(555) 111-1111',
      companyName: 'Johnson Family',
      address: { street: '123 Oak Street', city: 'Austin', state: 'TX', zip: '78701', lat: 30.2672, lng: -97.7431 },
      projects: ['proj-1'],
      totalSpent: 12500,
      rating: 5,
      createdAt: '2023-06-15T00:00:00Z',
      isActive: true,
    },
    {
      id: 'client-2',
      email: 'sarah.smith@email.com',
      password: 'client123',
      name: 'Sarah Smith',
      role: 'client',
      phone: '(555) 222-2222',
      address: { street: '456 Maple Ave', city: 'Dallas', state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970 },
      projects: ['proj-2', 'proj-3'],
      totalSpent: 28500,
      rating: 5,
      createdAt: '2023-08-20T00:00:00Z',
      isActive: true,
    },
    {
      id: 'emp-1',
      email: 'carlos.martinez@mscelectric.com',
      password: 'employee123',
      name: 'Carlos Martinez',
      role: 'employee',
      phone: '(555) 333-3333',
      avatar: 'CM',
      title: 'Master Electrician',
      hourlyRate: 85,
      specialties: ['Panel Upgrades', 'Commercial', 'Troubleshooting', 'Code Compliance'],
      certifications: ['Master Electrician License', 'OSHA 30'],
      assignedProjects: ['proj-1', 'proj-4'],
      completedProjects: 145,
      rating: 4.9,
      availability: 'busy',
      location: { lat: 30.2672, lng: -97.7431, lastUpdated: new Date().toISOString() },
      createdAt: '2020-03-10T00:00:00Z',
      isActive: true,
    },
    {
      id: 'emp-2',
      email: 'maria.garcia@mscelectric.com',
      password: 'employee123',
      name: 'Maria Garcia',
      role: 'employee',
      phone: '(555) 444-4444',
      avatar: 'MG',
      title: 'Journeyman Electrician',
      hourlyRate: 65,
      specialties: ['Residential', 'EV Charging', 'Smart Home', 'Lighting'],
      certifications: ['Journeyman License', 'EVITP Certified'],
      assignedProjects: ['proj-2'],
      completedProjects: 89,
      rating: 4.8,
      availability: 'available',
      location: { lat: 32.7767, lng: -96.7970, lastUpdated: new Date().toISOString() },
      createdAt: '2021-05-15T00:00:00Z',
      isActive: true,
    },
    {
      id: 'sub-1',
      email: 'juan.rodriguez@jrelectric.com',
      password: 'sub123',
      name: 'Juan Rodriguez',
      role: 'subcontractor',
      phone: '(555) 555-5555',
      avatar: 'JR',
      companyName: 'JR Electric Solutions',
      businessLicense: 'TCL-987654',
      insuranceExpiry: '2025-12-31',
      hourlyRate: 75,
      specialties: ['Commercial', 'Industrial', 'New Construction'],
      assignedProjects: ['proj-4'],
      rating: 4.7,
      availability: 'available',
      serviceArea: ['TX', 'OK'],
      createdAt: '2022-01-20T00:00:00Z',
      isActive: true,
    },
    {
      id: 'sub-2',
      email: 'ana.lopez@lopezlighting.com',
      password: 'sub123',
      name: 'Ana Lopez',
      role: 'subcontractor',
      phone: '(555) 666-6666',
      avatar: 'AL',
      companyName: 'Lopez Lighting Design',
      businessLicense: 'TCL-123456',
      insuranceExpiry: '2025-06-30',
      hourlyRate: 70,
      specialties: ['Lighting Design', 'LED Retrofit', 'Accent Lighting', 'Landscape Lighting'],
      assignedProjects: ['proj-3'],
      rating: 4.9,
      availability: 'busy',
      serviceArea: ['TX'],
      createdAt: '2022-03-15T00:00:00Z',
      isActive: true,
    },
  ];

  localStorage.setItem('msc_users', JSON.stringify(users));

  // Create sample projects
  const projects: Project[] = [
    {
      id: 'proj-1',
      name: 'Johnson Residence - Full Electrical Upgrade',
      description: 'Complete electrical panel upgrade, rewiring, and smart home integration for a 3,500 sq ft home.',
      clientId: 'client-1',
      contractId: 'contract-1',
      status: 'in-progress',
      priority: 'high',
      address: { street: '123 Oak Street', city: 'Austin', state: 'TX', zip: '78701', lat: 30.2672, lng: -97.7431 },
      estimatedValue: 18500,
      actualValue: 12500,
      startDate: '2024-01-15',
      estimatedEndDate: '2024-02-28',
      progress: 65,
      projectManagerId: 'user-admin-1',
      assignedElectricians: ['emp-1'],
      assignedSubcontractors: [],
      workOrders: [
        {
          id: 'wo-1',
          projectId: 'proj-1',
          title: 'Panel Upgrade - Phase 1',
          description: 'Remove old panel, install new 400A service panel with surge protection',
          status: 'completed',
          assignedTo: ['emp-1'],
          priority: 'high',
          estimatedHours: 16,
          actualHours: 14,
          materialsNeeded: ['400A Panel', 'Breakers', 'Surge Protector'],
          scheduledDate: '2024-01-15',
          completedDate: '2024-01-17',
          checklist: [
            { id: 'c1', text: 'Disconnect power', completed: true, completedBy: 'emp-1', completedAt: '2024-01-15T08:00:00Z' },
            { id: 'c2', text: 'Remove old panel', completed: true, completedBy: 'emp-1', completedAt: '2024-01-15T12:00:00Z' },
            { id: 'c3', text: 'Install new panel', completed: true, completedBy: 'emp-1', completedAt: '2024-01-16T17:00:00Z' },
            { id: 'c4', text: 'Connect circuits', completed: true, completedBy: 'emp-1', completedAt: '2024-01-17T14:00:00Z' },
          ],
          notes: 'Panel upgrade completed successfully. All circuits tested and working.',
          createdBy: 'user-admin-1',
          createdAt: '2024-01-10T00:00:00Z',
        },
        {
          id: 'wo-2',
          projectId: 'proj-1',
          title: 'Smart Home Wiring',
          description: 'Install smart switches, outlets, and home automation hub',
          status: 'in-progress',
          assignedTo: ['emp-1'],
          priority: 'medium',
          estimatedHours: 24,
          actualHours: 12,
          materialsNeeded: ['Smart Switches', 'Smart Outlets', 'Hub', 'Low Voltage Wire'],
          scheduledDate: '2024-01-22',
          checklist: [
            { id: 'c5', text: 'Install hub', completed: true },
            { id: 'c6', text: 'Replace switches', completed: false },
            { id: 'c7', text: 'Configure automation', completed: false },
          ],
          notes: '',
          createdBy: 'user-admin-1',
          createdAt: '2024-01-18T00:00:00Z',
        },
      ],
      materials: [
        { id: 'mat-1', name: '400A Main Panel', description: 'Square D Homeline', quantity: 1, unit: 'ea', unitCost: 1200, supplier: 'Graybar', ordered: true, delivered: true, deliveredDate: '2024-01-12' },
        { id: 'mat-2', name: 'Smart Switches', description: 'Lutron Caseta Wireless', quantity: 24, unit: 'ea', unitCost: 55, supplier: 'Amazon', ordered: true, delivered: true, deliveredDate: '2024-01-20' },
      ],
      timeEntries: [],
      photos: [],
      notes: [],
      invoices: ['inv-1', 'inv-2'],
      expenses: [],
      history: [],
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-25T00:00:00Z',
    },
    {
      id: 'proj-2',
      name: 'Smith Residence - EV Charger Installation',
      description: 'Install Level 2 EV charger in garage with dedicated 240V circuit',
      clientId: 'client-2',
      status: 'completed',
      priority: 'medium',
      address: { street: '456 Maple Ave', city: 'Dallas', state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970 },
      estimatedValue: 3500,
      actualValue: 3200,
      startDate: '2024-01-08',
      estimatedEndDate: '2024-01-10',
      actualEndDate: '2024-01-09',
      progress: 100,
      assignedElectricians: ['emp-2'],
      assignedSubcontractors: [],
      workOrders: [],
      materials: [],
      timeEntries: [],
      photos: [],
      notes: [],
      invoices: ['inv-3'],
      expenses: [],
      history: [],
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-09T00:00:00Z',
    },
    {
      id: 'proj-3',
      name: 'Smith Residence - Outdoor Lighting',
      description: 'Design and install landscape lighting system with smart controls',
      clientId: 'client-2',
      status: 'in-progress',
      priority: 'medium',
      address: { street: '456 Maple Ave', city: 'Dallas', state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970 },
      estimatedValue: 8500,
      actualValue: 0,
      startDate: '2024-02-01',
      estimatedEndDate: '2024-02-15',
      progress: 25,
      assignedElectricians: ['emp-2'],
      assignedSubcontractors: ['sub-2'],
      workOrders: [],
      materials: [],
      timeEntries: [],
      photos: [],
      notes: [],
      invoices: [],
      expenses: [],
      history: [],
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-02-05T00:00:00Z',
    },
    {
      id: 'proj-4',
      name: 'Downtown Plaza - Commercial Fit-out',
      description: 'Complete electrical installation for new retail space including panel, lighting, and outlets',
      clientId: 'client-3',
      status: 'in-progress',
      priority: 'urgent',
      address: { street: '789 Commerce St', city: 'Austin', state: 'TX', zip: '78701', lat: 30.2711, lng: -97.7437 },
      estimatedValue: 45000,
      actualValue: 15000,
      startDate: '2024-01-10',
      estimatedEndDate: '2024-03-15',
      progress: 35,
      assignedElectricians: ['emp-1'],
      assignedSubcontractors: ['sub-1'],
      workOrders: [],
      materials: [],
      timeEntries: [],
      photos: [],
      notes: [],
      invoices: ['inv-4'],
      expenses: [],
      history: [],
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
  ];

  localStorage.setItem('msc_projects', JSON.stringify(projects));

  // Create sample invoices
  const invoices: Invoice[] = [
    {
      id: 'inv-1',
      projectId: 'proj-1',
      clientId: 'client-1',
      invoiceNumber: 'INV-2024-0012',
      status: 'paid',
      items: [
        { id: 'item-1', description: 'Panel Upgrade - Labor', quantity: 14, unit: 'hours', unitPrice: 85, total: 1190, category: 'labor' },
        { id: 'item-2', description: '400A Main Panel', quantity: 1, unit: 'ea', unitPrice: 1200, total: 1200, category: 'materials' },
        { id: 'item-3', description: 'Breakers & Accessories', quantity: 1, unit: 'lot', unitPrice: 450, total: 450, category: 'materials' },
      ],
      subtotal: 2840,
      taxRate: 0.0825,
      taxAmount: 234.30,
      discount: 0,
      total: 3074.30,
      amountPaid: 3074.30,
      balanceDue: 0,
      issueDate: '2024-01-18',
      dueDate: '2024-02-02',
      paidDate: '2024-01-20',
      paymentMethod: 'Credit Card',
      aiGenerated: false,
      notes: 'Deposit for panel upgrade work',
      terms: 'Net 15',
      createdBy: 'user-admin-1',
      createdAt: '2024-01-18T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      sentAt: '2024-01-18T00:00:00Z',
    },
    {
      id: 'inv-2',
      projectId: 'proj-1',
      clientId: 'client-1',
      invoiceNumber: 'INV-2024-0015',
      status: 'sent',
      items: [
        { id: 'item-4', description: 'Smart Home Installation - Labor', quantity: 12, unit: 'hours', unitPrice: 85, total: 1020, category: 'labor' },
        { id: 'item-5', description: 'Smart Switches (24 units)', quantity: 24, unit: 'ea', unitPrice: 55, total: 1320, category: 'materials' },
        { id: 'item-6', description: 'Smart Hub', quantity: 1, unit: 'ea', unitPrice: 150, total: 150, category: 'materials' },
      ],
      subtotal: 2490,
      taxRate: 0.0825,
      taxAmount: 205.43,
      discount: 0,
      total: 2695.43,
      amountPaid: 0,
      balanceDue: 2695.43,
      issueDate: '2024-01-25',
      dueDate: '2024-02-09',
      aiGenerated: true,
      aiPrompt: 'Generate invoice for smart home installation work completed',
      notes: 'Progress invoice for smart home work',
      terms: 'Net 15',
      createdBy: 'user-admin-1',
      createdAt: '2024-01-25T00:00:00Z',
      updatedAt: '2024-01-25T00:00:00Z',
      sentAt: '2024-01-25T00:00:00Z',
    },
    {
      id: 'inv-3',
      projectId: 'proj-2',
      clientId: 'client-2',
      invoiceNumber: 'INV-2024-0010',
      status: 'paid',
      items: [
        { id: 'item-7', description: 'EV Charger Installation - Labor', quantity: 8, unit: 'hours', unitPrice: 65, total: 520, category: 'labor' },
        { id: 'item-8', description: 'ChargePoint Home Flex', quantity: 1, unit: 'ea', unitPrice: 750, total: 750, category: 'materials' },
        { id: 'item-9', description: 'Conduit & Wire', quantity: 1, unit: 'lot', unitPrice: 180, total: 180, category: 'materials' },
        { id: 'item-10', description: 'Permit', quantity: 1, unit: 'ea', unitPrice: 150, total: 150, category: 'permits' },
      ],
      subtotal: 1600,
      taxRate: 0.0825,
      taxAmount: 132,
      discount: 0,
      total: 1732,
      amountPaid: 1732,
      balanceDue: 0,
      issueDate: '2024-01-09',
      dueDate: '2024-01-24',
      paidDate: '2024-01-10',
      paymentMethod: 'Bank Transfer',
      aiGenerated: false,
      notes: '',
      terms: 'Net 15',
      createdBy: 'user-admin-1',
      createdAt: '2024-01-09T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
      sentAt: '2024-01-09T00:00:00Z',
    },
    {
      id: 'inv-4',
      projectId: 'proj-4',
      clientId: 'client-3',
      invoiceNumber: 'INV-2024-0008',
      status: 'overdue',
      items: [
        { id: 'item-11', description: 'Commercial Fit-out - Phase 1 Labor', quantity: 120, unit: 'hours', unitPrice: 75, total: 9000, category: 'labor' },
        { id: 'item-12', description: 'Electrical Panel & Components', quantity: 1, unit: 'lot', unitPrice: 3500, total: 3500, category: 'materials' },
      ],
      subtotal: 12500,
      taxRate: 0.0825,
      taxAmount: 1031.25,
      discount: 0,
      total: 13531.25,
      amountPaid: 0,
      balanceDue: 13531.25,
      issueDate: '2024-01-25',
      dueDate: '2024-02-09',
      aiGenerated: false,
      notes: 'Phase 1 payment - URGENT',
      terms: 'Net 15',
      createdBy: 'user-admin-1',
      createdAt: '2024-01-25T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
      sentAt: '2024-01-25T00:00:00Z',
    },
  ];

  localStorage.setItem('msc_invoices', JSON.stringify(invoices));

  // Create sample contracts
  const contracts: Contract[] = [
    {
      id: 'contract-1',
      clientId: 'client-1',
      projectId: 'proj-1',
      contractNumber: 'CTR-2024-0008',
      title: 'Residential Electrical Services Agreement',
      status: 'active',
      totalValue: 18500,
      paymentTerms: '50% deposit, 25% at rough-in, 25% at completion',
      depositAmount: 9250,
      depositPaid: true,
      scopeOfWork: 'Complete electrical panel upgrade from 200A to 400A service. Install smart home automation system including 24 smart switches, 8 smart outlets, and central hub. Full home rewiring as needed.',
      exclusions: 'Drywall repair, painting, landscaping',
      startDate: '2024-01-15',
      estimatedCompletion: '2024-02-28',
      statementsOfWork: ['sow-1', 'sow-2'],
      clientSigned: true,
      clientSignedAt: '2024-01-10',
      companySigned: true,
      companySignedAt: '2024-01-12',
      createdBy: 'user-admin-1',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z',
    },
  ];

  localStorage.setItem('msc_contracts', JSON.stringify(contracts));

  // Create sample SOWs
  const sows: StatementOfWork[] = [
    {
      id: 'sow-1',
      contractId: 'contract-1',
      projectId: 'proj-1',
      title: 'Panel Upgrade Phase',
      description: 'Remove existing 200A panel and install new 400A service panel with surge protection and proper labeling',
      status: 'completed',
      tasks: [
        { id: 'task-1', description: 'Disconnect and remove old panel', estimatedHours: 4, actualHours: 4, completed: true, completedAt: '2024-01-15' },
        { id: 'task-2', description: 'Install new 400A panel', estimatedHours: 8, actualHours: 6, completed: true, completedAt: '2024-01-16' },
        { id: 'task-3', description: 'Reconnect all circuits', estimatedHours: 4, actualHours: 4, completed: true, completedAt: '2024-01-17' },
      ],
      deliverables: [
        { id: 'del-1', name: 'Installed Panel', description: '400A panel fully operational', dueDate: '2024-01-17', completed: true, completedAt: '2024-01-17', approved: true },
        { id: 'del-2', name: 'Inspection Certificate', description: 'City electrical inspection passed', dueDate: '2024-01-20', completed: true, completedAt: '2024-01-19', approved: true },
      ],
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      milestones: [
        { id: 'mile-1', name: 'Panel Installation Complete', description: 'New panel installed and tested', dueDate: '2024-01-17', completed: true, completedAt: '2024-01-17', paymentAmount: 5000, paymentReleased: true },
      ],
      estimatedCost: 5000,
      actualCost: 4800,
      assignedWorkers: ['emp-1'],
      createdBy: 'user-admin-1',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
  ];

  localStorage.setItem('msc_sows', JSON.stringify(sows));

  console.log('Database seeded successfully!');
};

// Analytics helper
export const calculateAnalytics = (): DashboardAnalytics => {
  const projects = db.getProjects();
  const invoices = db.getInvoices();
  const users = db.getUsers();

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
