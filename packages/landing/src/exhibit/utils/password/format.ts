export const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const s = Math.floor(diff / 1000),
    m = Math.floor(s / 60),
    h = Math.floor(m / 60),
    d = Math.floor(h / 24);
  if (s < 60) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const clearClipboardAfter = (seconds: number): void => {
  if (seconds <= 0) return;
  window.setTimeout(() => {
    void navigator.clipboard.writeText('');
  }, seconds * 1000);
};

export const maskPassword = (pw: string): string =>
  '•'.repeat(Math.min(pw.length, 16));
