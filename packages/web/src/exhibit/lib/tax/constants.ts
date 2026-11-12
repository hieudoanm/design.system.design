import type { TaxBracket } from '@/exhibit/types/tax';

export const PERSONAL_DEDUCTION = 11_000_000;
export const DEPENDENT_DEDUCTION = 4_400_000;
export const INSURANCE_CAP = 36_000_000;

export const EMPLOYEE_INSURANCE = { BHXH: 0.08, BHYT: 0.015, BHTN: 0.01 };
export const EMPLOYER_INSURANCE = { BHXH: 0.175, BHYT: 0.03, BHTN: 0.01 };

export const TAX_BRACKETS: readonly TaxBracket[] = [
  { limit: 5_000_000, rate: 0.05 },
  { limit: 5_000_000, rate: 0.1 },
  { limit: 8_000_000, rate: 0.15 },
  { limit: 14_000_000, rate: 0.2 },
  { limit: 20_000_000, rate: 0.25 },
  { limit: 28_000_000, rate: 0.3 },
  { limit: Infinity, rate: 0.35 },
];

export const TAX_TYPE_LABELS: Record<string, string> = {
  PIT: 'Thuế thu nhập cá nhân (PIT)',
  CIT: 'Thuế thu nhập doanh nghiệp (CIT)',
  VAT: 'Thuế giá trị gia tăng (VAT)',
  FCT: 'Thuế nhà thầu (FCT)',
};

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  submitted: 'Đã nộp',
  accepted: 'Chấp nhận',
  rejected: 'Từ chối',
  amended: 'Đã sửa đổi',
};

export const AUDIT_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang kiểm tra',
  completed: 'Hoàn thành',
  flagged: 'Có vấn đề',
};
