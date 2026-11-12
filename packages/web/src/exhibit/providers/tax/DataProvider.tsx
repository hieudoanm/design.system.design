'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { UserProvider, useUserContext } from './entities/UserProvider';
import {
  CompaniesProvider,
  useCompaniesContext,
} from './entities/CompaniesProvider';
import {
  SubmissionsProvider,
  useSubmissionsContext,
} from './entities/SubmissionsProvider';
import { AuditsProvider, useAuditsContext } from './entities/AuditsProvider';
import type { User, Company, TaxSubmission, TaxAudit } from '@/exhibit/types/tax';

interface DataContextValue {
  user: User | null;
  companies: Company[];
  submissions: TaxSubmission[];
  audits: TaxAudit[];
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  updateUser: (user: User) => Promise<void>;
  addCompany: (company: Company) => Promise<void>;
  updateCompany: (company: Company) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addSubmission: (submission: TaxSubmission) => Promise<void>;
  updateSubmission: (submission: TaxSubmission) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  addAudit: (audit: TaxAudit) => Promise<void>;
  updateAudit: (audit: TaxAudit) => Promise<void>;
  deleteAudit: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const DataAggregator = ({ children }: { children: ReactNode }) => {
  console.log('[DataAggregator] render');
  const auth = useAuth();
  const userCtx = useUserContext();
  const companiesCtx = useCompaniesContext();
  const submissionsCtx = useSubmissionsContext();
  const auditsCtx = useAuditsContext();

  const loading =
    userCtx.loading ||
    companiesCtx.loading ||
    submissionsCtx.loading ||
    auditsCtx.loading;

  const value: DataContextValue = {
    user: userCtx.user,
    companies: companiesCtx.companies,
    submissions: submissionsCtx.submissions,
    audits: auditsCtx.audits,
    loading,
    isAuthenticated: auth.isAuthenticated,

    login: auth.login,
    logout: auth.logout,
    forgotPassword: auth.forgotPassword,
    resetPassword: auth.resetPassword,
    updateUser: userCtx.updateUser,
    addCompany: companiesCtx.addCompany,
    updateCompany: companiesCtx.updateCompany,
    deleteCompany: companiesCtx.deleteCompany,
    addSubmission: submissionsCtx.addSubmission,
    updateSubmission: submissionsCtx.updateSubmission,
    deleteSubmission: submissionsCtx.deleteSubmission,
    addAudit: auditsCtx.addAudit,
    updateAudit: auditsCtx.updateAudit,
    deleteAudit: auditsCtx.deleteAudit,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  console.log('[DataProvider] render');
  return (
    <AuthProvider>
      <UserProvider>
        <CompaniesProvider>
          <SubmissionsProvider>
            <AuditsProvider>
              <DataAggregator>{children}</DataAggregator>
            </AuditsProvider>
          </SubmissionsProvider>
        </CompaniesProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
