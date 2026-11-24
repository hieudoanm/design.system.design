import type { FC, ReactNode } from 'react';

interface LeadParagraphProps {
  children: ReactNode;
}

export const LeadParagraph: FC<LeadParagraphProps> = ({ children }) => (
  <p
    className="text-base-content/80 text-lg leading-relaxed"
    data-testid="lead-paragraph">
    {children}
  </p>
);
