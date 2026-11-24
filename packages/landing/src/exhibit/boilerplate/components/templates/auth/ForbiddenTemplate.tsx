import type { FC } from 'react';
import { FiHome, FiLifeBuoy, FiLock } from 'react-icons/fi';

export const ForbiddenTemplate: FC = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
    <div className="badge badge-error badge-lg gap-2">
      <FiLock className="h-4 w-4" />
      Access denied
    </div>
    <div>
      <p className="text-error mb-2 text-xs tracking-[0.2em] uppercase">
        Error 403
      </p>
      <h1 className="mb-3 text-6xl font-black tracking-tight md:text-8xl">
        403
      </h1>
      <p className="text-base-content/50 text-sm">
        You do not have permission to access this page.
      </p>
    </div>
    <div className="flex flex-wrap justify-center gap-3">
      <a href="/" className="btn btn-primary gap-2">
        <FiHome className="h-4 w-4" />
        Go home
      </a>
      <a href="/shared/about" className="btn btn-ghost gap-2">
        <FiLifeBuoy className="h-4 w-4" />
        Contact support
      </a>
    </div>
  </div>
);

ForbiddenTemplate.displayName = 'ForbiddenTemplate';
