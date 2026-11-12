import type { FC, ReactNode } from 'react';
import './exhibit.css';

/*
 * The scope every ported Exhibit component renders inside. The compat
 * classes in exhibit.css only apply under `.exhibit`, and the semantic
 * colours resolve through site tokens, so the frame needs no theme prop —
 * it follows `data-theme` on <html> like everything else.
 */
export const ExhibitFrame: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={`exhibit ${className ?? ''}`}>{children}</div>;
