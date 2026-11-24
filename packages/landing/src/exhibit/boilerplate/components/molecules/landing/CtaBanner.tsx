import type { FC } from 'react';

interface CtaBannerProps {
  title: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
}

export const CtaBanner: FC<CtaBannerProps> = ({
  title,
  description,
  primaryLabel = 'Get started',
  secondaryLabel = 'Learn more',
  className = '',
}) => {
  return (
    <section
      data-testid="cta-banner"
      className={`bg-primary text-primary-content rounded-2xl p-8 ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="text-2xl font-medium">{title}</h2>
          {description && (
            <p className="text-primary-content/80 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-neutral">
            {primaryLabel}
          </button>
          <button type="button" className="btn btn-ghost text-primary-content">
            {secondaryLabel}
          </button>
        </div>
      </div>
    </section>
  );
};
