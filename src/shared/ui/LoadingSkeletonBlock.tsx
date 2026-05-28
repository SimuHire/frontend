import { Skeleton } from './Skeleton';
import { cn } from './classnames';

type LoadingSkeletonBlockProps = {
  label: string;
  className?: string;
  lines?: number;
};

export function LoadingSkeletonBlock({
  label,
  className,
  lines = 3,
}: LoadingSkeletonBlockProps) {
  return (
    <div
      className={cn('space-y-3', className)}
      role="status"
      aria-label={label}
    >
      <Skeleton className="h-4 w-44" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-3 bg-secondary/80',
            index === lines - 1 ? 'w-2/3' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}
