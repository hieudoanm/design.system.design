'use client';

import type { AnchorHTMLAttributes, FC, MouseEvent, ReactNode } from 'react';
import { useContext } from 'react';
import { BoilerplateNavContext } from './nav';

/*
 * Drop-in replacement for next/link inside the ported boilerplate.
 * Internal kit paths ('/developer/dashboard') are intercepted and routed
 * through the gallery's navigate(); external links behave normally.
 */
interface BoilerplateLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'hrefLang'
> {
  href: string | { pathname?: string; query?: unknown; hash?: string };
  children?: ReactNode;
}

const toHref = (href: BoilerplateLinkProps['href']): string => {
  if (typeof href === 'string') return href;
  const pathname = href.pathname ?? '#';
  return `${pathname}${href.hash ?? ''}`;
};

const BoilerplateLink: FC<BoilerplateLinkProps> = ({ href, onClick, children, ...rest }) => {
  const nav = useContext(BoilerplateNavContext);
  const url = toHref(href);
  const internal = url.startsWith('/') && !url.startsWith('//');

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!internal || event.defaultPrevented) return;
    event.preventDefault();
    nav?.navigate(url);
  };

  return (
    <a {...rest} href={url} onClick={handleClick}>
      {children}
    </a>
  );
};

export default BoilerplateLink;
