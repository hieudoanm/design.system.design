import type { FC, ReactNode } from 'react';

interface PhoneMockupProps {
  camera?: boolean;
  className?: string;
  children?: ReactNode;
}

export const PhoneMockup: FC<PhoneMockupProps> = ({
  camera = true,
  className = '',
  children,
}) => (
  <div className={`phone-mockup border-base-content/20 border ${className}`}>
    {camera && <div className="camera" aria-hidden="true" />}
    <div className="display">{children}</div>
  </div>
);
