import type { FC } from 'react';

interface ReporterNameProps {
  name: string;
  role?: string;
}

export const ReporterName: FC<ReporterNameProps> = ({
  name,
  role = 'Reporter',
}) => (
  <span
    className="text-base-content/70 flex items-center gap-1 text-sm"
    data-testid="reporter-name">
    <span aria-hidden>✍</span>
    <span className="font-medium">{name}</span>
    {role && <span className="text-base-content/40">· {role}</span>}
  </span>
);
