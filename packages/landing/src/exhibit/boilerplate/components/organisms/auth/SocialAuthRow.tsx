'use client';

import type { FC, ReactNode } from 'react';

interface SocialProvider {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface SocialAuthRowProps {
  providers: SocialProvider[];
  onProvider?: (id: string) => void;
  dividerText?: string;
}

export const SocialAuthRow: FC<SocialAuthRowProps> = ({
  providers,
  onProvider,
  dividerText = 'or continue with',
}) => (
  <div data-testid="social-auth-row" className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <span className="border-base-content/20 flex-1 border-t" />
      <span className="text-base-content/50 text-xs uppercase">
        {dividerText}
      </span>
      <span className="border-base-content/20 flex-1 border-t" />
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          data-testid={`provider-${provider.id}`}
          onClick={() => onProvider?.(provider.id)}
          className="btn btn-outline w-full">
          {provider.icon && <span>{provider.icon}</span>}
          {provider.label}
        </button>
      ))}
    </div>
  </div>
);
