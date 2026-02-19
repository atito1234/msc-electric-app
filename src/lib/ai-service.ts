// MSC Electric - AI Service
// Simulates AI-powered features for the project management system

import type { InvoiceItem, Project, WorkOrder, TimeEntry, Material } from './database';

export interface AIInvoiceSuggestion {
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  confidence: number;
  reasoning: string;
}

export interface AIWorkOrderSuggestion {
  title: string;
  description: string;
  estimatedHours: number;
  materialsNeeded: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
}

export interface AIScheduleOptimization {
  suggestedDate: string;
  suggestedWorkers: string[];
  estimatedDuration: number;
  conflicts: string[];
  reasoning: string;
}

export interface AICostEstimate {
  estimatedCost: number;
  breakdown: {
    labor: number;
    materials: number;
    permits: number;
    contingency: number;
  };
  confidence: number;
  reasoning: string;
}

// AI Invoice Generation
export const generateInvoiceWithAI = (
  _project: Project,
  workOrders: WorkOrder[],
  timeEntries: TimeEntry[],
  materials: Material[],
  taxRate: number = 0.0825
): AIInvoiceSuggestion => {
  const items: InvoiceItem[] = [];
  let laborTotal = 0;
  let materialsTotal = 0;
  
  // Analyze completed work orders
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed');
  
  completedWorkOrders.forEach(wo => {
    // Calculate labor from time entries
    const woTimeEntries = timeEntries.filter(te => te.workOrderId === wo.id);
    const totalHours = woTimeEntries.reduce((sum, te) => sum + te.hours, 0);
    
    if (totalHours > 0) {
      const avgRate = woTimeEntries.reduce((sum, te) => sum + te.hourlyRate, 0) / woTimeEntries.length;
      const laborCost = totalHours * avgRate;
      laborTotal += laborCost;
      
      items.push({
        id: `ai-labor-${wo.id}`,
        description: `${wo.title} - Labor (${totalHours.toFixed(1)} hours)`,
        quantity: totalHours,
        unit: 'hours',
        unitPrice: avgRate,
        total: laborCost,
        category: 'labor',
      });
    }
  });
  
  // Add materials that were delivered
  const deliveredMaterials = materials.filter(m => m.delivered);
  
  deliveredMaterials.forEach(mat => {
    const matTotal = mat.quantity * mat.unitCost;
    materialsTotal += matTotal;
    
    items.push({
      id: `ai-mat-${mat.id}`,
      description: `${mat.name}${mat.description ? ` - ${mat.description}` : ''}`,
      quantity: mat.quantity,
      unit: mat.unit,
      unitPrice: mat.unitCost,
      total: matTotal,
      category: 'materials',
    });
  });
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  // Generate reasoning
  const reasoning = generateInvoiceReasoning(completedWorkOrders, deliveredMaterials, laborTotal, materialsTotal);
  
  return {
    items,
    subtotal,
    taxAmount,
    total,
    confidence: calculateConfidence(items.length, completedWorkOrders.length, deliveredMaterials.length),
    reasoning,
  };
};

// AI Work Order Creation
export const generateWorkOrderWithAI = (
  project: Project,
  description: string,
  _existingWorkOrders: WorkOrder[]
): AIWorkOrderSuggestion => {
  // Analyze the description for keywords
  const lowerDesc = description.toLowerCase();
  
  // Determine priority based on keywords
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  if (lowerDesc.includes('urgent') || lowerDesc.includes('emergency') || lowerDesc.includes('outage')) {
    priority = 'urgent';
  } else if (lowerDesc.includes('important') || lowerDesc.includes('critical')) {
    priority = 'high';
  } else if (lowerDesc.includes('routine') || lowerDesc.includes('maintenance')) {
    priority = 'low';
  }
  
  // Estimate hours based on work type
  let estimatedHours = 4;
  if (lowerDesc.includes('panel') || lowerDesc.includes('service')) {
    estimatedHours = 16;
  } else if (lowerDesc.includes('rewire') || lowerDesc.includes('rough')) {
    estimatedHours = 24;
  } else if (lowerDesc.includes('fixture') || lowerDesc.includes('outlet')) {
    estimatedHours = 2;
  } else if (lowerDesc.includes('inspection')) {
    estimatedHours = 1;
  }
  
  // Generate materials list
  const materialsNeeded: string[] = [];
  if (lowerDesc.includes('panel')) {
    materialsNeeded.push('Electrical Panel', 'Breakers', 'Conduit', 'Wire');
  }
  if (lowerDesc.includes('outlet') || lowerDesc.includes('receptacle')) {
    materialsNeeded.push('Outlets', 'Faceplates', 'Wire nuts');
  }
  if (lowerDesc.includes('switch')) {
    materialsNeeded.push('Switches', 'Faceplates');
  }
  if (lowerDesc.includes('light') || lowerDesc.includes('fixture')) {
    materialsNeeded.push('Light Fixtures', 'Mounting Hardware');
  }
  if (lowerDesc.includes('ev') || lowerDesc.includes('charger')) {
    materialsNeeded.push('EV Charger Unit', 'Conduit', 'Wire', 'Breaker');
  }
  if (materialsNeeded.length === 0) {
    materialsNeeded.push('Standard electrical supplies');
  }
  
  // Generate title
  const title = generateWorkOrderTitle(description, project.name);
  
  return {
    title,
    description,
    estimatedHours,
    materialsNeeded,
    priority,
    confidence: 0.85,
  };
};

// AI Schedule Optimization
export const optimizeScheduleWithAI = (
  project: Project,
  workers: { id: string; name: string; availability: string; location?: { lat: number; lng: number } }[],
  workOrderDuration: number,
  preferredDate?: string
): AIScheduleOptimization => {
  // Find available workers
  const availableWorkers = workers.filter(w => w.availability === 'available');
  
  // Sort by proximity to project (simulated)
  const sortedWorkers = availableWorkers.sort((a, b) => {
    if (a.location && b.location && project.address.lat && project.address.lng) {
      const distA = calculateDistance(a.location.lat, a.location.lng, project.address.lat, project.address.lng);
      const distB = calculateDistance(b.location.lat, b.location.lng, project.address.lat, project.address.lng);
      return distA - distB;
    }
    return 0;
  });
  
  // Suggest date (next business day if not specified)
  const suggestedDate = preferredDate || getNextBusinessDay();
  
  // Suggest top 2 workers
  const suggestedWorkers = sortedWorkers.slice(0, 2).map(w => w.id);
  
  // Check for conflicts (simulated)
  const conflicts: string[] = [];
  if (availableWorkers.length < 2) {
    conflicts.push('Limited worker availability');
  }
  if (project.status === 'cancelled') {
    conflicts.push('Project has been cancelled');
  }
  
  return {
    suggestedDate,
    suggestedWorkers,
    estimatedDuration: workOrderDuration,
    conflicts,
    reasoning: `Scheduled based on worker availability and proximity to project location. ${availableWorkers.length} workers available.`,
  };
};

// AI Cost Estimation
export const estimateCostWithAI = (
  projectDescription: string,
  projectType: string,
  squareFootage?: number
): AICostEstimate => {
  const lowerDesc = projectDescription.toLowerCase();
  
  // Base costs by project type
  let baseLabor = 2000;
  let baseMaterials = 1500;
  let permits = 200;
  
  if (projectType === 'Panel Upgrade') {
    baseLabor = 1500;
    baseMaterials = 2000;
    permits = 300;
  } else if (projectType === 'EV Charging') {
    baseLabor = 600;
    baseMaterials = 1200;
    permits = 150;
  } else if (projectType === 'Smart Home') {
    baseLabor = 2500;
    baseMaterials = 3000;
    permits = 0;
  } else if (projectType === 'Commercial') {
    baseLabor = 5000;
    baseMaterials = 4000;
    permits = 500;
  } else if (projectType === 'Lighting') {
    baseLabor = 800;
    baseMaterials = 600;
    permits = 0;
  }
  
  // Adjust based on description keywords
  if (lowerDesc.includes('full') || lowerDesc.includes('complete')) {
    baseLabor *= 1.5;
    baseMaterials *= 1.5;
  }
  if (lowerDesc.includes('emergency') || lowerDesc.includes('urgent')) {
    baseLabor *= 1.3;
  }
  if (lowerDesc.includes('new construction')) {
    baseMaterials *= 1.2;
  }
  
  // Adjust by square footage if provided
  if (squareFootage && squareFootage > 0) {
    const sqftFactor = Math.max(1, squareFootage / 2000);
    baseLabor *= sqftFactor;
    baseMaterials *= sqftFactor;
  }
  
  const contingency = (baseLabor + baseMaterials + permits) * 0.1;
  const estimatedCost = baseLabor + baseMaterials + permits + contingency;
  
  return {
    estimatedCost: Math.round(estimatedCost),
    breakdown: {
      labor: Math.round(baseLabor),
      materials: Math.round(baseMaterials),
      permits: Math.round(permits),
      contingency: Math.round(contingency),
    },
    confidence: 0.75,
    reasoning: `Estimate based on ${projectType} project type, scope description, and historical data from similar projects.`,
  };
};

// AI-Powered Project Insights
export const generateProjectInsights = (project: Project): string[] => {
  const insights: string[] = [];
  
  // Progress analysis
  if (project.progress < 25 && new Date(project.startDate || '') < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    insights.push('Project progress is slower than expected. Consider reviewing resource allocation.');
  }
  
  // Budget analysis
  if (project.actualValue > project.estimatedValue * 0.8 && project.progress < 60) {
    insights.push('Budget utilization is high relative to progress. Monitor expenses closely.');
  }
  
  // Timeline analysis
  if (project.estimatedEndDate) {
    const daysRemaining = Math.ceil((new Date(project.estimatedEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const expectedProgress = 100 - (daysRemaining / 60) * 100; // Assuming 60-day average project
    
    if (project.progress < expectedProgress - 15) {
      insights.push(`Project is behind schedule by approximately ${Math.round(expectedProgress - project.progress)}%.`);
    }
  }
  
  // Invoice analysis
  const totalInvoiced = project.invoices.length * (project.estimatedValue / 3); // Rough estimate
  if (totalInvoiced < project.actualValue * 0.5 && project.progress > 50) {
    insights.push('Consider issuing a progress invoice to maintain cash flow.');
  }
  
  // Team analysis
  if (project.assignedElectricians.length === 0 && project.assignedSubcontractors.length === 0) {
    insights.push('No workers assigned to this project. Assign team members to proceed.');
  }
  
  if (insights.length === 0) {
    insights.push('Project is on track. No immediate action required.');
  }
  
  return insights;
};

// Helper functions
const generateInvoiceReasoning = (
  workOrders: WorkOrder[],
  materials: Material[],
  laborTotal: number,
  materialsTotal: number
): string => {
  const parts: string[] = [];
  
  if (workOrders.length > 0) {
    parts.push(`Based on ${workOrders.length} completed work order(s) with ${workOrders.reduce((sum, wo) => sum + wo.actualHours, 0).toFixed(1)} total hours logged.`);
  }
  
  if (materials.length > 0) {
    parts.push(`Includes ${materials.length} delivered material item(s) totaling $${materialsTotal.toFixed(2)}.`);
  }
  
  parts.push(`Labor charges: $${laborTotal.toFixed(2)}. Materials: $${materialsTotal.toFixed(2)}.`);
  
  return parts.join(' ');
};

const calculateConfidence = (itemCount: number, workOrderCount: number, materialCount: number): number => {
  let confidence = 0.7;
  
  // More data = higher confidence
  if (itemCount > 5) confidence += 0.1;
  if (workOrderCount > 1) confidence += 0.1;
  if (materialCount > 2) confidence += 0.05;
  
  return Math.min(confidence, 0.95);
};

const generateWorkOrderTitle = (description: string, projectName: string): string => {
  // Extract key terms
  const keywords = ['panel', 'outlet', 'switch', 'light', 'fixture', 'wire', 'circuit', 'breaker', 'install', 'repair', 'replace'];
  const foundKeywords = keywords.filter(kw => description.toLowerCase().includes(kw));
  
  if (foundKeywords.length > 0) {
    const mainKeyword = foundKeywords[0];
    const action = description.toLowerCase().includes('install') ? 'Install' :
                   description.toLowerCase().includes('repair') ? 'Repair' :
                   description.toLowerCase().includes('replace') ? 'Replace' : 'Service';
    return `${action} ${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} - ${projectName}`;
  }
  
  return `Electrical Work - ${projectName}`;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getNextBusinessDay = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  
  // Skip weekends
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
};

// Natural language query processing (simulated)
export const processNaturalLanguageQuery = (query: string): { type: string; params: any } => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('invoice') || lowerQuery.includes('bill')) {
    return { type: 'invoices', params: {} };
  }
  
  if (lowerQuery.includes('project') || lowerQuery.includes('job')) {
    return { type: 'projects', params: {} };
  }
  
  if (lowerQuery.includes('worker') || lowerQuery.includes('employee') || lowerQuery.includes('electrician')) {
    return { type: 'workers', params: {} };
  }
  
  if (lowerQuery.includes('payment') || lowerQuery.includes('paid') || lowerQuery.includes('overdue')) {
    return { type: 'payments', params: { status: 'overdue' } };
  }
  
  if (lowerQuery.includes('schedule') || lowerQuery.includes('calendar') || lowerQuery.includes('today')) {
    return { type: 'schedule', params: {} };
  }
  
  return { type: 'general', params: { query } };
};
