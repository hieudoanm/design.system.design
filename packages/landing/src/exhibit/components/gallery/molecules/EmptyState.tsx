import { type FC } from 'react';
import { FiImage } from 'react-icons/fi';

interface EmptyStateProps {
  title: string;
  hint?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ title, hint }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
    <div className="bg-base-200 text-base-content/40 rounded-full p-4">
      <FiImage className="size-6" />
    </div>
    <p className="text-sm font-medium">{title}</p>
    {hint && <p className="text-base-content/50 text-xs">{hint}</p>}
  </div>
);
