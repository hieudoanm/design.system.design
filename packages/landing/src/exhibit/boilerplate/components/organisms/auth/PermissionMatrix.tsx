'use client';

import type { FC } from 'react';

interface PermissionMatrixProps {
  roles: string[];
  permissions: string[];
  value: Record<string, string[]>;
  onChange?: (role: string, permission: string, checked: boolean) => void;
  readonly?: boolean;
}

export const PermissionMatrix: FC<PermissionMatrixProps> = ({
  roles,
  permissions,
  value,
  onChange,
  readonly = false,
}) => {
  const isChecked = (role: string, permission: string): boolean =>
    (value[role] ?? []).includes(permission);

  return (
    <div data-testid="permission-matrix" className="overflow-x-auto">
      {roles.length === 0 ? (
        <p className="text-base-content/40 py-4 text-center text-sm">
          No roles configured.
        </p>
      ) : (
        <table className="table-zebra table-sm table">
          <thead>
            <tr>
              <th>Role</th>
              {permissions.map((permission) => (
                <th key={permission} className="text-center">
                  {permission}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role}>
                <td className="font-medium">{role}</td>
                {permissions.map((permission) => (
                  <td key={permission} className="text-center">
                    <input
                      type="checkbox"
                      data-testid={`cell-${role}-${permission}`}
                      checked={isChecked(role, permission)}
                      disabled={readonly}
                      aria-label={`${role} ${permission}`}
                      onChange={(e) =>
                        onChange?.(role, permission, e.target.checked)
                      }
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
