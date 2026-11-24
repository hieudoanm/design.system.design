import type { FC, ReactNode } from 'react';

interface DangerZoneItem {
  id: string;
  label: string;
  description?: string;
  action: ReactNode;
}

interface DangerZoneProps {
  items: DangerZoneItem[];
  title?: string;
}

export const DangerZone: FC<DangerZoneProps> = ({
  items,
  title = 'Danger zone',
}) => (
  <div className="border-error/30 bg-error/5 w-full rounded-xl border p-4">
    <h3 className="text-error mb-3 text-sm font-medium">{title}</h3>
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            {item.description && (
              <p className="text-base-content/50 text-xs">{item.description}</p>
            )}
          </div>
          <div className="shrink-0">{item.action}</div>
        </div>
      ))}
    </div>
  </div>
);
