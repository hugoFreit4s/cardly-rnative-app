export function formatCountdown(dueAt: string, nowMs: number = Date.now()): string {
  const target = new Date(dueAt).getTime();
  const diff = Math.max(0, target - nowMs);
  if (diff === 0) {
    return '00:00:00';
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

export function isDue(dueAt: string, nowMs: number = Date.now()): boolean {
  return new Date(dueAt).getTime() <= nowMs;
}
