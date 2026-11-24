import type { FC } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'active' | 'on-leave' | 'remote';
}

interface EmployeeDirectoryProps {
  employees: Employee[];
  onSelect?: (employee: Employee) => void;
}

const statusClass: Record<Employee['status'], string> = {
  active: 'badge-success',
  'on-leave': 'badge-warning',
  remote: 'badge-info',
};

export const EmployeeDirectory: FC<EmployeeDirectoryProps> = ({
  employees,
  onSelect,
}) => {
  const active = employees.filter((e) => e.status === 'active').length;
  const onLeave = employees.filter((e) => e.status === 'on-leave').length;

  return (
    <div
      className="flex w-full flex-col gap-4"
      data-testid="employee-directory">
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Total</p>
            <p className="text-2xl font-semibold" data-testid="employee-total">
              {employees.length}
            </p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Active</p>
            <p className="text-success text-2xl font-semibold">{active}</p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">On leave</p>
            <p className="text-warning text-2xl font-semibold">{onLeave}</p>
          </div>
        </div>
      </div>
      <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
        <table className="table-zebra table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                onClick={() => onSelect?.(employee)}
                className={onSelect ? 'cursor-pointer' : undefined}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content w-8 rounded-full">
                        <span className="text-xs">
                          {employee.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </span>
                      </div>
                    </div>
                    <span className="font-medium">{employee.name}</span>
                  </div>
                </td>
                <td>{employee.role}</td>
                <td>{employee.department}</td>
                <td>{employee.email}</td>
                <td>
                  <span
                    className={`badge badge-sm ${statusClass[employee.status]}`}>
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="text-base-content/40 text-center">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

EmployeeDirectory.displayName = 'EmployeeDirectory';
