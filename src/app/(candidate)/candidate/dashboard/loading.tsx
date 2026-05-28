export default function Loading() {
  return (
    <div className="p-6 space-y-3">
      <div className="h-6 w-48 animate-pulse rounded bg-secondary" />
      <div className="h-4 w-72 animate-pulse rounded bg-secondary/80" />
      <div className="h-4 w-64 animate-pulse rounded bg-secondary/80" />
    </div>
  );
}
