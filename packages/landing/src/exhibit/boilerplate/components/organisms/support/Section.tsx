import type { FC, ReactNode } from 'react';

interface SectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'start' | 'center';
  children?: ReactNode;
  className?: string;
}

export const Section: FC<SectionProps> = ({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  children,
  className = '',
}) => (
  <section className={`flex flex-col gap-4 ${className}`}>
    <div
      className={`flex w-full flex-col gap-2 ${
        align === 'center' ? 'items-center text-center' : 'items-start'
      }`}>
      {eyebrow && (
        <span className="text-primary text-sm font-semibold tracking-wide uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl">{title}</h2>
      {description && (
        <p className="text-base-content/60 max-w-2xl">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
    {children && <div className="mt-2">{children}</div>}
  </section>
);

Section.displayName = 'Section';
