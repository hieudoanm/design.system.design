import type { FC } from 'react';

interface Employee {
  name: string;
  role: string;
  department: string;
  email?: string;
  location?: string;
  status?: 'active' | 'on-leave' | 'probation' | 'terminated';
  initials?: string;
}

interface EmployeeCardProps {
  employee: Employee;
  className?: string;
}

const statusClass: Record<NonNullable<Employee['status']>, string> = {
  active: 'badge-success',
  'on-leave': 'badge-warning',
  probation: 'badge-info',
  terminated: 'badge-neutral',
};

export const EmployeeCard: FC<EmployeeCardProps> = ({
  employee,
  className = '',
}) => {
  const { name, role, department, email, location, initials } = employee;
  const status = employee.status ?? 'active';
  const badge = statusClass[status];
  const fallback =
    initials ??
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <article
      data-testid="employee-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content w-12 rounded-full">
            <span className="text-sm font-semibold">{fallback}</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-medium">{name}</h3>
            <span className={`badge ${badge} badge-sm`}>{status}</span>
          </div>
          <p className="text-base-content/70 text-sm">{role}</p>
          <p className="text-base-content/50 text-xs">{department}</p>
          {email && <p className="text-base-content/50 text-xs">{email}</p>}
          {location && (
            <p className="text-base-content/50 text-xs">{location}</p>
          )}
        </div>
      </div>
    </article>
  );
};
