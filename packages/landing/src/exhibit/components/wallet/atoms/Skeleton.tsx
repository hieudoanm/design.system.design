import { FC } from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-base-300 animate-pulse rounded ${className}`} />
);

export const SkeletonText: FC<SkeletonProps> = ({ className = '' }) => (
  <Skeleton className={`h-4 w-full ${className}`} />
);

export const SkeletonCircle: FC<SkeletonProps> = ({ className = '' }) => (
  <Skeleton className={`h-10 w-10 rounded-full ${className}`} />
);

export const SkeletonCard: FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-base-200 rounded-box space-y-3 p-4 ${className}`}>
    <SkeletonText className="w-1/3" />
    <SkeletonText className="w-2/3" />
    <SkeletonText className="w-1/2" />
  </div>
);

export default Skeleton;
