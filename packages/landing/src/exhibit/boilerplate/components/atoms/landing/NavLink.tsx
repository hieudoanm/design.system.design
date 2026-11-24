import type { FC } from 'react';

interface NavLinkProps {
  label: string;
  href: string;
  active?: boolean;
}

export const NavLink: FC<NavLinkProps> = ({ label, href, active = false }) => (
  <a
    data-testid="nav-link"
    href={href}
    aria-current={active ? 'page' : undefined}
    className={`text-sm transition-colors ${
      active
        ? 'text-primary font-semibold'
        : 'text-base-content/70 hover:text-base-content'
    }`}>
    {label}
  </a>
);
