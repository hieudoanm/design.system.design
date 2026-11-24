import type { FC } from 'react';

interface ArrowLinkProps {
  label: string;
  href: string;
}

export const ArrowLink: FC<ArrowLinkProps> = ({ label, href }) => (
  <a
    data-testid="arrow-link"
    href={href}
    className="link link-primary flex items-center gap-1 text-sm">
    {label}
    <span aria-hidden="true">→</span>
  </a>
);
