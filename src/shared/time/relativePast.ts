export function formatRelativePast(iso: string, nowMs: number = Date.now()) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 'recently';
  const deltaSec = Math.floor((nowMs - t) / 1000);
  if (deltaSec < 60) return 'just now';
  if (deltaSec < 3600) {
    const m = Math.floor(deltaSec / 60);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (deltaSec < 86400) {
    const h = Math.floor(deltaSec / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.floor(deltaSec / 86400);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}
