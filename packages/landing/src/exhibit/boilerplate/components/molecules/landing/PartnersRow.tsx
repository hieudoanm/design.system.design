import type { FC } from 'react';

interface PartnersRowProps {
  partners: string[];
  title?: string;
  className?: string;
}

export const PartnersRow: FC<PartnersRowProps> = ({
  partners = [],
  title = 'Trusted by',
  className = '',
}) => {
  return (
    <div
      data-testid="partners-row"
      className={`flex flex-col items-center gap-4 ${className}`}>
      {title && (
        <span className="text-base-content/50 text-xs tracking-widest uppercase">
          {title}
        </span>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {partners.length === 0 ? (
          <p className="text-base-content/50 text-sm">No partners</p>
        ) : (
          partners.map((partner, index) => (
            <span
              key={`${partner}-${index}`}
              className="bg-base-200 text-base-content/60 border-base-content/10 rounded-lg border px-4 py-2 text-sm font-medium">
              {partner}
            </span>
          ))
        )}
      </div>
    </div>
  );
};
