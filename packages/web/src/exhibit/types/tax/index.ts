export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'accountant' | 'viewer';
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  industry: string;
  employeeCount: number;
  representative: string;
  createdAt: string;
}

export interface TaxSubmission {
  id: string;
  companyId: string;
  companyName: string;
  taxType: 'PIT' | 'CIT' | 'VAT' | 'FCT';
  period: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'amended';
  submittedAt?: string;
  deadline: string;
  totalTaxAmount: number;
  documents: TaxDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxDocument {
  id: string;
  name: string;
  type: '01-KK/TNCN' | '02-KK/TNCN' | '03-KK/TNCN' | 'GTGT' | 'TNDN' | 'other';
  status: 'pending' | 'uploaded' | 'verified';
  fileUrl?: string;
  uploadedAt?: string;
}

export interface TaxAudit {
  id: string;
  submissionId: string;
  companyId: string;
  companyName: string;
  auditType: 'internal' | 'government' | 'automated';
  status: 'pending' | 'in_progress' | 'completed' | 'flagged';
  findings: AuditFinding[];
  checks: AuditCheck[];
  auditor: string;
  startDate: string;
  endDate?: string;
  riskScore: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditFinding {
  id: string;
  category:
    | 'discrepancy'
    | 'missing_document'
    | 'compliance_error'
    | 'overpayment'
    | 'underpayment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  amount?: number;
  recommendation: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface AuditCheck {
  id: string;
  name: string;
  description: string;
  category: 'document' | 'calculation' | 'deadline' | 'compliance';
  passed: boolean | null;
  details?: string;
}

export interface CalculatorHistory {
  id: string;
  income: number;
  dependents: number;
  period: 'monthly' | 'annual';
  salaryMode: 'gross' | 'net';
  insuranceEnabled: boolean;
  result: CalculatorResult;
  savedAt: string;
}

export interface CalculatorResult {
  grossMonthly: number;
  insuranceBase: number;
  employeeInsurance: number;
  employerInsurance: number;
  personalDeduction: number;
  dependentDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  breakdown: TaxBreakdownItem[];
  totalTax: number;
  netMonthly: number;
  effectiveTaxRate: number;
  totalLaborCost: number;
}

export interface TaxBracket {
  limit: number;
  rate: number;
}

export interface TaxBreakdownItem {
  rate: number;
  taxable: number;
  tax: number;
}

export type Period = 'monthly' | 'annual';
export type SalaryMode = 'gross' | 'net';
