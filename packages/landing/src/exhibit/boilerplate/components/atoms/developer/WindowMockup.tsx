import type { FC, ReactNode } from 'react';

interface WindowMockupProps {
  title?: string;
  className?: string;
  children?: ReactNode;
}

export const WindowMockup: FC<WindowMockupProps> = ({
  title,
  className = '',
  children,
}) => (
  <div className={`window-mockup border-base-content/20 border ${className}`}>
    <div className="window-mockup-top-bar">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="bg-error size-3 rounded-full" aria-hidden="true" />
        <span className="bg-warning size-3 rounded-full" aria-hidden="true" />
        <span className="bg-success size-3 rounded-full" aria-hidden="true" />
        {title && (
          <span className="text-base-content/50 ml-2 text-xs">{title}</span>
        )}
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);
