export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const formatAbsoluteTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();

export const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsMarkdown = (
  title: string,
  messages: { role: string; content: string; timestamp: number }[]
): string => {
  const header = `# ${title}\n\n`;
  const body = messages
    .map(
      (m) =>
        `## ${m.role === 'user' ? 'You' : 'Assistant'}\n\n${
          m.content
        }\n\n*${formatAbsoluteTime(m.timestamp)}*\n`
    )
    .join('\n---\n\n');
  return header + body;
};

export const exportAsJSON = (
  conversation: unknown,
  messages: unknown[]
): string =>
  JSON.stringify({ conversation, messages, exportedAt: Date.now() }, null, 2);
