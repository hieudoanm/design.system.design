import { type FC, type ReactNode } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

interface PanelHeaderProps {
  title: string;
  onBack: () => void;
  children?: ReactNode;
  backLabel?: string;
}

export const PanelHeader: FC<PanelHeaderProps> = ({
  title,
  onBack,
  children,
  backLabel,
}) => (
  <header className="border-base-300 bg-base-200 flex h-14 shrink-0 items-center gap-3 border-b px-4">
    <button className="btn btn-ghost btn-sm" onClick={onBack}>
      {backLabel ? backLabel : <FiArrowLeft className="size-4" />}
    </button>
    <h1 className="text-sm font-semibold">{title}</h1>
    {children}
  </header>
);
