import { FC, ReactNode } from 'react';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';
import { Navbar } from '@/exhibit/boilerplate/components/organisms/landing/Navbar';

interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface PageShellProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  headerAction?: ReactNode;
  headerBadges?: ReactNode;
  navItems?: NavItem[];
  maxWidth?: string;
  gap?: string;
  children: ReactNode;
  className?: string;
}

export const PageShell: FC<PageShellProps> = ({
  title,
  subtitle,
  backHref,
  headerAction,
  headerBadges,
  navItems,
  maxWidth = 'max-w-2xl',
  gap = 'gap-6',
  children,
  className = '',
}) => (
  <div
    className={`flex min-h-dvh flex-col ${navItems ? 'pb-20' : ''} ${className}`}>
    <Header
      title={title}
      subtitle={subtitle}
      backHref={backHref}
      action={headerAction}
      badges={headerBadges}
    />
    <main
      className={`mx-auto flex w-full ${maxWidth} flex-1 flex-col ${gap} p-6`}>
      {children}
    </main>
    {navItems && <Navbar items={navItems} />}
  </div>
);

PageShell.displayName = 'PageShell';
