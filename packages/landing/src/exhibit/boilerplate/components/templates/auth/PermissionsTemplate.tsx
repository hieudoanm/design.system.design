'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiShield } from 'react-icons/fi';

type Role = 'Admin' | 'Editor' | 'Viewer';

interface Permission {
  id: string;
  name: string;
  admin: boolean;
  editor: boolean;
  viewer: boolean;
}

const INITIAL_PERMISSIONS: Permission[] = [
  { id: 'p1', name: 'View projects', admin: true, editor: true, viewer: true },
  { id: 'p2', name: 'Edit projects', admin: true, editor: true, viewer: false },
  {
    id: 'p3',
    name: 'Delete projects',
    admin: true,
    editor: false,
    viewer: false,
  },
  {
    id: 'p4',
    name: 'Manage members',
    admin: true,
    editor: false,
    viewer: false,
  },
  { id: 'p5', name: 'View billing', admin: true, editor: true, viewer: false },
  { id: 'p6', name: 'Export data', admin: true, editor: false, viewer: false },
];

const ROLES: Role[] = ['Admin', 'Editor', 'Viewer'];

const ROLE_KEY: Record<Role, 'admin' | 'editor' | 'viewer'> = {
  Admin: 'admin',
  Editor: 'editor',
  Viewer: 'viewer',
};

const isGranted = (permission: Permission, role: Role): boolean =>
  permission[ROLE_KEY[role]];

export const PermissionsTemplate: FC = () => {
  const [permissions, setPermissions] =
    useState<Permission[]>(INITIAL_PERMISSIONS);

  const adminCount = permissions.filter((p) => p.admin).length;
  const editorCount = permissions.filter((p) => p.editor).length;
  const viewerCount = permissions.filter((p) => p.viewer).length;

  const getRoleCount = (role: Role): number => {
    if (role === 'Admin') return adminCount;
    if (role === 'Editor') return editorCount;
    return viewerCount;
  };

  const toggleRole = (id: string, role: Role) => {
    setPermissions((prev) =>
      prev.map((permission) => {
        if (permission.id !== id) return permission;
        if (role === 'Editor') {
          return { ...permission, editor: !permission.editor };
        }
        if (role === 'Viewer') {
          return { ...permission, viewer: !permission.viewer };
        }
        return permission;
      })
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Permissions</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Control what each role can do in the workspace.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiShield />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Admin permissions</p>
              <p className="text-2xl font-bold tracking-tight">
                {adminCount} of {permissions.length} permissions granted
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Permission</th>
                    {ROLES.map((role) => (
                      <th
                        key={role}
                        className="px-4 py-3 text-center font-medium">
                        {role}
                        <span className="mt-1 block text-[10px] font-normal normal-case">
                          {getRoleCount(role)} granted
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr
                      key={permission.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {permission.name}
                      </td>
                      {ROLES.map((role) => (
                        <td key={role} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isGranted(permission, role)}
                            disabled={role === 'Admin'}
                            onChange={() => toggleRole(permission.id, role)}
                            aria-label={`Grant ${permission.name} for ${role}`}
                            className="checkbox checkbox-primary checkbox-sm"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

PermissionsTemplate.displayName = 'PermissionsTemplate';
