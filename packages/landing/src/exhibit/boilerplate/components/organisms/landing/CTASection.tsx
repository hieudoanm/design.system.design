import Link from '@/exhibit/boilerplate/link';
import type { FC } from 'react';

interface CtaLink {
  label: string;
  href: string;
}

interface CTASectionProps {
  title: string;
  description?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  badge?: string;
}

export const CTASection: FC<CTASectionProps> = ({
  title,
  description,
  primaryCta,
  secondaryCta,
  badge,
}) => (
  <section className="bg-base-200 border-base-content/10 flex flex-col items-center gap-4 rounded-2xl border px-6 py-14 text-center">
    {badge && <span className="badge badge-primary">{badge}</span>}
    <h2 className="max-w-2xl text-3xl">{title}</h2>
    {description && (
      <p className="text-base-content/60 max-w-xl text-sm">{description}</p>
    )}
    {(primaryCta || secondaryCta) && (
      <div className="mt-2 flex flex-wrap justify-center gap-3">
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
