import { FC } from 'react';

export type LoadingVariant = 'app' | 'auth' | 'blog' | 'store';

interface LoadingTemplateProps {
  variant?: LoadingVariant;
}

const AppSkeleton: FC = () => (
  <div className="flex min-h-dvh flex-col pb-20">
    <header className="border-base-300 bg-base-100 sticky top-0 z-10 border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="bg-base-300 h-5 w-24 animate-pulse rounded" />
          <div className="bg-base-300 h-3 w-40 animate-pulse rounded" />
        </div>
      </div>
    </header>
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="bg-base-300 h-4 w-20 animate-pulse rounded" />
          <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="bg-base-300 h-4 w-32 animate-pulse rounded" />
                <div className="bg-base-300 h-8 w-40 animate-pulse rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="bg-base-300 h-4 w-24 animate-pulse rounded" />
                <div className="bg-base-300 h-8 w-40 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </main>
  </div>
);

const AuthSkeleton: FC = () => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-base-300 bg-base-100 sticky top-0 z-10 border-b px-6 py-4">
      <div className="bg-base-300 h-5 w-20 animate-pulse rounded" />
    </header>
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="bg-base-300 h-8 w-48 animate-pulse rounded" />
      <div className="border-base-content/10 bg-base-200 w-full rounded-2xl border p-6">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="bg-base-300 h-3 w-16 animate-pulse rounded" />
              <div className="bg-base-300 h-10 w-full animate-pulse rounded" />
            </div>
          ))}
          <div className="bg-primary/30 mt-2 h-10 w-full animate-pulse rounded-lg" />
        </div>
      </div>
    </main>
  </div>
);

const BlogSkeleton: FC = () => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-base-300 bg-base-100 sticky top-0 z-10 border-b px-6 py-4">
      <div className="flex flex-col gap-2">
        <div className="bg-base-300 h-5 w-20 animate-pulse rounded" />
        <div className="bg-base-300 h-3 w-32 animate-pulse rounded" />
      </div>
    </header>
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-base-300 h-8 w-20 animate-pulse rounded-lg"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-base-content/10 bg-base-200 rounded-xl border p-6">
            <div className="flex flex-wrap gap-1.5">
              <div className="bg-base-300 h-4 w-12 animate-pulse rounded-full" />
              <div className="bg-base-300 h-4 w-16 animate-pulse rounded-full" />
            </div>
            <div className="bg-base-300 mt-3 h-5 w-3/4 animate-pulse rounded" />
            <div className="bg-base-300 mt-2 h-4 w-full animate-pulse rounded" />
            <div className="bg-base-300 mt-1 h-4 w-2/3 animate-pulse rounded" />
            <div className="mt-4 flex items-center gap-2">
              <div className="bg-base-300 h-3 w-3 animate-pulse rounded" />
              <div className="bg-base-300 h-3 w-24 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

const StoreSkeleton: FC = () => (
  <div className="flex min-h-dvh flex-col pb-20">
    <header className="border-base-300 bg-base-100 sticky top-0 z-10 border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="bg-base-300 h-5 w-32 animate-pulse rounded" />
        <div className="bg-base-300 h-5 w-5 animate-pulse rounded" />
      </div>
    </header>
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6">
      <div className="bg-base-300 mb-4 h-10 w-full animate-pulse rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-base-content/10 bg-base-200 rounded-xl border p-4">
            <div className="bg-base-300 mb-3 h-32 w-full animate-pulse rounded-lg" />
            <div className="bg-base-300 mb-2 h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-base-300 mb-4 h-3 w-1/2 animate-pulse rounded" />
            <div className="bg-base-300 h-8 w-full animate-pulse rounded-lg" />
          </div>
        ))}
      </div>
    </main>
  </div>
);

export const LoadingTemplate: FC<LoadingTemplateProps> = ({
  variant = 'app',
}) => {
  switch (variant) {
    case 'auth':
      return <AuthSkeleton />;
    case 'blog':
      return <BlogSkeleton />;
    case 'store':
      return <StoreSkeleton />;
    default:
      return <AppSkeleton />;
  }
};

LoadingTemplate.displayName = 'LoadingTemplate';
