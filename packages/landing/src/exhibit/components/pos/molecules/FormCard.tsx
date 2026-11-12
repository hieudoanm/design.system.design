import { type FC, type ReactNode } from 'react';

interface FormCardProps {
  title: string;
  children: ReactNode;
}

export const FormCard: FC<FormCardProps> = ({ title, children }) => (
  <div className="card bg-base-200 mb-4">
    <div className="card-body">
      <h2 className="card-title text-sm">{title}</h2>
      {children}
    </div>
  </div>
);
