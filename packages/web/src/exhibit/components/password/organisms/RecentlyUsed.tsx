'use client';

import { type FC } from 'react';
import Link from 'next/link';
import {
  FiCreditCard,
  FiFileText,
  FiGlobe,
  FiKey,
  FiUser,
} from 'react-icons/fi';
import { formatRelativeTime } from '@/exhibit/utils/password/format';
import type { VaultItem, VaultItemType } from '@/exhibit/types/password';

const typeIcons: Record<VaultItemType, typeof FiGlobe> = {
  login: FiGlobe,
  card: FiCreditCard,
  identity: FiUser,
  note: FiFileText,
  ssh: FiKey,
};

interface RecentlyUsedProps {
  items: VaultItem[];
}

export const RecentlyUsed: FC<RecentlyUsedProps> = ({ items }) => {
  if (items.length === 0) return null;
  return (
    <section className="mb-6" data-testid="recently-used">
      <h2 className="text-base-content/50 mb-2 text-xs font-semibold tracking-wide uppercase">
        Recently used
      </h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {items.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <Link
              key={item.id}
              href={`/design-system/exhibits/password`}
              className="card bg-base-200 card-body hover:bg-base-300 p-3 transition-colors">
              <Icon className="size-4" />
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="text-base-content/40 truncate text-xs">
                {formatRelativeTime(item.lastUsed ?? item.updatedAt)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
