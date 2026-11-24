import type { FC } from 'react';

interface LogEntry {
  id: string;
  message: string;
  time?: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
}

interface LogViewerProps {
  entries: LogEntry[];
  title?: string;
}

const levelClass: Record<string, string> = {
  debug: 'text-base-content/40',
  info: 'text-info',
  warn: 'text-warning',
  error: 'text-error',
};

export const LogViewer: FC<LogViewerProps> = ({
  entries,
  title = 'Log viewer',
}) => (
  <section className="py-4">
    <header className="mb-3 flex items-center justify-between">
      <h2 className="text-xl">{title}</h2>
      <span className="badge badge-ghost">{entries.length} lines</span>
    </header>
    <div className="mockup-code max-h-80 overflow-y-auto">
      {entries.length === 0 && (
        <pre data-prefix=" ">
          <code>No log entries.</code>
        </pre>
      )}
      {entries.map((entry) => (
        <pre key={entry.id} data-prefix={entry.time ?? ' '}>
          <code className={levelClass[entry.level ?? '']}>{entry.message}</code>
        </pre>
      ))}
    </div>
  </section>
);
