import type { FC } from 'react';

interface MiniMapSection {
  id: string;
  label: string;
}

interface MiniMapProps {
  sections: MiniMapSection[];
  active?: string;
  className?: string;
}

export const MiniMap: FC<MiniMapProps> = ({
  sections,
  active,
  className = '',
}) => (
  <div
    aria-label="Page overview"
    className={`border-base-content/10 bg-base-200 flex w-24 flex-col gap-1.5 rounded-xl border p-2 ${className}`}>
    {sections.map((section) => {
      const isActive = section.id === active;
      return (
        <div
          key={section.id}
          title={section.label}
          aria-current={isActive ? 'location' : undefined}
          className={`flex h-8 items-center justify-center rounded-md text-[10px] ${
            isActive
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 text-base-content/50'
          }`}>
          {section.label}
        </div>
      );
    })}
  </div>
);
