'use client';

import { type FC, type ReactNode } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiBattery, FiWifi } from 'react-icons/fi';
import { TabBar } from '@/exhibit/components/gallery/organisms/TabBar';

interface PhoneFrameProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  backHref?: string;
}

export const PhoneFrame: FC<PhoneFrameProps> = ({
  title,
  children,
  actions,
  backHref,
}) => (
  <div className="bg-base-200/60 flex min-h-[calc(100vh-3.25rem)] items-center justify-center p-4">
    <div
      data-testid="phone-frame"
      className="border-neutral bg-base-100 relative flex h-[680px] max-h-[82vh] w-[360px] max-w-full flex-col overflow-hidden rounded-[2.5rem] border-[10px] shadow-2xl">
      <div className="text-base-content/70 relative flex items-center justify-between px-6 pt-2 pb-1 text-[11px] font-medium">
        <span>9:41</span>
        <div
          data-testid="phone-notch"
          className="bg-neutral absolute top-1.5 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full"
        />
        <div className="flex items-center gap-1">
          <FiWifi className="size-3.5" />
          <FiBattery className="size-3.5" />
        </div>
      </div>
      <header className="flex items-center gap-2 px-4 pt-1 pb-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="btn btn-ghost btn-xs btn-circle">
            <FiArrowLeft className="size-4" />
          </Link>
        )}
        <h1 className="flex-1 truncate text-base font-bold">{title}</h1>
        {actions}
      </header>
      <div className="flex-1 overflow-y-auto">{children}</div>
      <TabBar />
    </div>
  </div>
);
