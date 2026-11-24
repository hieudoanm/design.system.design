'use client';

import type { FC, MouseEvent, ReactElement } from 'react';
import { cloneElement } from 'react';

interface SlotProps {
  className?: string;
  onClick?: (event: MouseEvent) => void;
  children: ReactElement<{
    className?: string;
    onClick?: (event: MouseEvent) => void;
  }>;
}

export const Slot: FC<SlotProps> = ({ children, className, onClick }) => {
  const childProps = children.props;

  return cloneElement(children, {
    ...children.props,
    className: [childProps.className, className].filter(Boolean).join(' '),
    onClick: (event: MouseEvent) => {
      childProps.onClick?.(event);
      onClick?.(event);
    },
  });
};

Slot.displayName = 'Slot';
