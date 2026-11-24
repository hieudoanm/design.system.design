'use client';

import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import type { FC } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showCopy?: boolean;
}

export const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language,
  title,
  showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="border-base-content/10 w-full overflow-hidden rounded-xl border">
      <div className="border-base-content/10 bg-base-300/30 flex items-center justify-between border-b px-3 py-2">
        <span className="text-base-content/50 text-xs">
          {title ?? language ?? 'code'}
        </span>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="btn btn-ghost btn-xs"
            aria-label="Copy code">
            {copied ? <FiCheck /> : <FiCopy />}
          </button>
        )}
      </div>
      <pre className="p-3">
        <code>{code}</code>
      </pre>
    </div>
  );
};
