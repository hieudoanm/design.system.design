import Link from '@/exhibit/boilerplate/link';
import { IoArrowBack } from 'react-icons/io5';
import type { FC, ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  action?: ReactNode;
  backHref?: string;
}

export const Header: FC<HeaderProps> = ({
  title,
  subtitle,
  badges,
  action,
  backHref,
}) => (
  <header className="border-base-300 bg-base-100 sticky top-0 z-10 border-b px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link href={backHref} className="btn btn-ghost btn-sm">
              <IoArrowBack className="text-lg" />
            </Link>
          )}
          <h1 className="text-lg">{title}</h1>
          {badges}
        </div>
        {subtitle && <p className="text-base-content/50 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  </header>
);
