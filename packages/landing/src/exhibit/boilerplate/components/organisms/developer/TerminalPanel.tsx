'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface TerminalLine {
  text: string;
  prefix?: string;
  type?: 'command' | 'output' | 'success' | 'error';
}

interface TerminalPanelProps {
  initialLines?: TerminalLine[];
  onCommand?: (command: string) => void;
  prompt?: string;
  title?: string;
}

const lineClass: Record<string, string> = {
  success: 'text-success',
  error: 'text-error',
};

export const TerminalPanel: FC<TerminalPanelProps> = ({
  initialLines = [],
  onCommand,
  prompt = '$',
  title = 'Terminal',
}) => {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [command, setCommand] = useState('');

  const run = () => {
    const input = command.trim();
    if (!input) return;
    setLines((prev) => [
      ...prev,
      { text: input, prefix: prompt, type: 'command' },
      { text: 'Command executed successfully.', type: 'success' },
    ]);
    setCommand('');
    onCommand?.(input);
  };

  return (
    <div className="border-base-content/10 overflow-hidden rounded-xl border">
      <header className="bg-base-200 border-base-content/10 flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex gap-1.5">
          <span className="bg-error size-3 rounded-full" />
          <span className="bg-warning size-3 rounded-full" />
          <span className="bg-success size-3 rounded-full" />
        </div>
      </header>
      <div className="mockup-code max-h-64 overflow-y-auto">
        {lines.map((line, index) => (
          <pre key={index} data-prefix={line.prefix}>
            <code className={lineClass[line.type ?? '']}>{line.text}</code>
          </pre>
        ))}
      </div>
      <form
        aria-label="Command form"
        className="bg-base-200 border-base-content/10 flex items-center gap-2 border-t px-4 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}>
        <span className="font-mono text-sm">{prompt}</span>
        <input
          aria-label="Terminal input"
          data-testid="terminal-input"
          className="input input-ghost input-sm w-full font-mono"
          value={command}
          placeholder="Type a command..."
          onChange={(e) => setCommand(e.target.value)}
        />
      </form>
    </div>
  );
};
