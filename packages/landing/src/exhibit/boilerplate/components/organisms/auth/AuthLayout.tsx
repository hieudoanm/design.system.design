import type { FC, ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  brand?: string;
}

export const AuthLayout: FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  brand = 'Boilerplate',
}) => (
  <div data-testid="auth-layout" className="bg-base-200 flex min-h-screen">
    <div className="bg-primary hidden w-1/2 flex-col justify-between p-10 lg:flex">
      <div className="flex items-center gap-2">
        <span className="bg-primary-content text-primary inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold">
          B
        </span>
        <span className="text-primary-content text-lg font-semibold">
          {brand}
        </span>
      </div>
      <div>
        <h2 className="text-primary-content text-3xl font-light">
          Build faster with modern tools.
        </h2>
        <p className="text-primary-content/70 mt-2 text-sm">
          A curated boilerplate combining Next.js, Tailwind CSS, DaisyUI, and
          TypeScript.
        </p>
      </div>
      <p className="text-primary-content/50 text-xs">
        © {new Date().getFullYear()} {brand}
      </p>
    </div>
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <span className="bg-primary text-primary-content inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold">
            B
          </span>
          <span className="text-lg font-semibold">{brand}</span>
        </div>
        <div className="card bg-base-100 border-base-200 border shadow-sm">
          <div className="card-body">
            <h1 className="text-2xl">{title}</h1>
            {subtitle && (
              <p className="text-base-content/50 text-sm">{subtitle}</p>
            )}
            <div className="mt-4">{children}</div>
          </div>
        </div>
        {footer && <div className="mt-4 text-center">{footer}</div>}
      </div>
    </div>
  </div>
);
