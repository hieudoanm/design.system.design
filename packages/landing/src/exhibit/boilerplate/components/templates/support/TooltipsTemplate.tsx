'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCopy, FiDownload, FiTrash2, FiX } from 'react-icons/fi';

interface TooltipDemo {
  tip: string;
  label: string;
  position: string;
  icon: FC<{ className?: string }>;
}

const TOOLTIPS: TooltipDemo[] = [
  {
    tip: 'Copy to clipboard',
    label: 'Copy',
    position: 'tooltip-top',
    icon: FiCopy,
  },
  {
    tip: 'Download file',
    label: 'Download',
    position: 'tooltip-right',
    icon: FiDownload,
  },
  {
    tip: 'Delete item',
    label: 'Delete',
    position: 'tooltip-bottom',
    icon: FiTrash2,
  },
];

export const TooltipsTemplate: FC = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Tooltips
          </p>
          <h1>Tooltips</h1>
          <p className="text-base-content/50 text-sm">
            Hover tooltips and a controlled popover.
          </p>
        </div>

        <div className="card border-base-content/10 bg-base-200 border">
          <div className="card-body p-5">
            <h3>Tooltips</h3>
            <p className="text-base-content/60 text-sm">
              Hover any button to see its tooltip.
            </p>
            <div className="flex flex-wrap gap-3">
              {TOOLTIPS.map((tooltip) => {
                const Icon = tooltip.icon;
                return (
                  <button
                    key={tooltip.label}
                    type="button"
                    className={`tooltip ${tooltip.position} btn btn-ghost btn-sm gap-1`}
                    data-tip={tooltip.tip}>
                    <Icon className="h-4 w-4" />
                    {tooltip.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card border-base-content/10 bg-base-200 border">
          <div className="card-body p-5">
            <h3>Popover</h3>
            <p className="text-base-content/60 text-sm">
              A floating card controlled by button state.
            </p>
            <div className="relative w-fit">
              <button
                type="button"
                onClick={() => setPopoverOpen((prev) => !prev)}
                className="btn btn-primary btn-sm">
                Show popover
              </button>
              {popoverOpen && (
                <div className="border-base-content/10 bg-base-200 absolute left-0 z-10 mt-2 w-64 rounded-xl border p-4 shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">Quick actions</p>
                      <p className="text-base-content/60 text-sm">
                        This popover is toggled by React state.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close popover"
                      onClick={() => setPopoverOpen(false)}
                      className="btn btn-ghost btn-xs">
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="btn btn-neutral btn-xs">
                      Action one
                    </button>
                    <button type="button" className="btn btn-ghost btn-xs">
                      Action two
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

TooltipsTemplate.displayName = 'TooltipsTemplate';
