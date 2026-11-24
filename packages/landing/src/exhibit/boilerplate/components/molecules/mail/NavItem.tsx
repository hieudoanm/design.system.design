import Link from '@/exhibit/boilerplate/link';
import type { FC, ReactNode } from 'react';

interface NavItemProps {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavItem: FC<NavItemProps> = ({
  label,
  href,
  icon,
  badge,
  active = false,
  onClick,
}) => (
  <li>
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
        active ? 'bg-primary text-primary-content' : 'hover:bg-base-200'
      }`}>
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span
          className={`badge badge-sm ${
            active ? 'badge-ghost text-primary-content' : 'badge-neutral'
          }`}>
          {badge}
        </span>
      )}
    </Link>
  </li>
);
