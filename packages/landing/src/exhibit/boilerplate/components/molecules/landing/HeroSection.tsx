import type { FC } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
}

export const HeroSection: FC<HeroSectionProps> = ({
  title,
  subtitle,
  badge,
  primaryLabel = 'Get started',
  secondaryLabel = 'Learn more',
  className = '',
}) => {
  return (
    <section
      data-testid="hero-section"
      className={`hero bg-base-200 min-h-72 rounded-2xl ${className}`}>
      <div className="hero-content flex flex-col items-center text-center">
        {badge && (
          <span className="badge badge-outline badge-primary badge-sm">
            {badge}
          </span>
        )}
        <h1 className="max-w-2xl text-3xl font-medium">{title}</h1>
        {subtitle && (
          <p className="text-base-content/70 max-w-xl text-sm leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-primary">
            {primaryLabel}
          </button>
          <button type="button" className="btn btn-outline">
            {secondaryLabel}
          </button>
        </div>
      </div>
    </section>
  );
};
