import { cn } from '@/shared/ui/classnames';

type LoadingDotsProps = {
  label?: string;
  className?: string;
};

export default function LoadingDots({
  label = 'Working',
  className,
}: LoadingDotsProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      aria-label={label}
      role="status"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
    </span>
  );
}
