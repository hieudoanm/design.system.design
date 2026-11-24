import type { FC, ReactNode } from 'react';

interface BrowserMockupProps {
  url?: string;
  className?: string;
  children?: ReactNode;
}

export const BrowserMockup: FC<BrowserMockupProps> = ({
  url,
  className = '',
  children,
}) => (
  <div className={`browser-mockup border-base-content/20 border ${className}`}>
    <div className="browser-mockup-top-bar">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="bg-error size-3 rounded-full" aria-hidden="true" />
        <span className="bg-warning size-3 rounded-full" aria-hidden="true" />
        <span className="bg-success size-3 rounded-full" aria-hidden="true" />
        {url && <div className="browser-mockup-address-bar">{url}</div>}
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);
