import type { FC } from 'react';

interface ClientLogoProps {
  name: string;
  logo?: string;
  url?: string;
  className?: string;
}

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const ClientLogo: FC<ClientLogoProps> = ({
  name,
  logo,
  url,
  className = '',
}) => {
  const content = (
    <span className="flex items-center gap-2">
      {logo ? (
        <span aria-hidden="true" className="text-lg">
          {logo}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="bg-base-200 text-base-content/60 border-base-content/10 flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold">
          {initialsOf(name)}
        </span>
      )}
      <span className="font-medium">{name}</span>
    </span>
  );

  return url ? (
    <a
      data-testid="client-logo"
      href={url}
      className={`text-base-content/60 hover:text-primary transition-colors ${className}`}>
      {content}
    </a>
  ) : (
    <div
      data-testid="client-logo"
      className={`text-base-content/60 ${className}`}>
      {content}
    </div>
  );
};
