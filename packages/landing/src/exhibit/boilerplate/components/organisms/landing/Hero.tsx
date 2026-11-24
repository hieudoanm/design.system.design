import Link from '@/exhibit/boilerplate/link';
import type { FC } from 'react';

interface HeroCta {
  label: string;
  href: string;
}

interface HeroProps {
  title: string;
  tagline?: string;
  description?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  badge?: string;
}

export const Hero: FC<HeroProps> = ({
  title,
  tagline,
  description,
  primaryCta,
  secondaryCta,
  badge,
}) => (
  <section className="bg-base-200 border-base-content/10 flex flex-col items-center gap-6 rounded-2xl border px-6 py-16 text-center">
    {badge && <span className="badge badge-primary">{badge}</span>}
    {tagline && (
      <span className="text-primary text-sm tracking-widest uppercase">
        {tagline}
      </span>
    )}
    <h1 className="max-w-2xl text-4xl">{title}</h1>
    {description && (
      <p className="text-base-content/60 max-w-xl text-lg">{description}</p>
    )}
    {(primaryCta || secondaryCta) && (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {primaryCta && (
          <Link href={primaryCta.href} className="btn btn-primary btn-lg">
            {primaryCta.label}
          </Link>
        )}
        {secondaryCta && (
          <Link href={secondaryCta.href} className="btn btn-outline btn-lg">
            {secondaryCta.label}
          </Link>
        )}
      </div>
    )}
  </section>
);
