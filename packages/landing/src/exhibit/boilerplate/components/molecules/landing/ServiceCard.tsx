import type { FC } from 'react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: string;
  features?: string[];
  className?: string;
}

export const ServiceCard: FC<ServiceCardProps> = ({
  title,
  description,
  icon = '✦',
  features = [],
  className = '',
}) => {
  return (
    <article
      data-testid="service-card"
      className={`card bg-base-200 border-base-content/10 border p-6 ${className}`}>
      <span
        aria-hidden="true"
        className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl text-xl">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-medium">{title}</h3>
      <p className="text-base-content/70 mt-2 text-sm leading-relaxed">
        {description}
      </p>
      {features.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5 text-sm">
          {features.map((feature, index) => (
            <li key={`${feature}-${index}`} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-success">
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};
