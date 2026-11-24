import type { FC, ReactNode } from 'react';

interface KbdProps {
  children: ReactNode;
}

export const Kbd: FC<KbdProps> = ({ children }) => <kbd>{children}</kbd>;
