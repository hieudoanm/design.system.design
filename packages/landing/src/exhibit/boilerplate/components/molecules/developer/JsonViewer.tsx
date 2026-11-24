'use client';

import type { FC, ReactNode } from 'react';
import { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  name?: string;
  defaultExpanded?: boolean;
  className?: string;
}

const typeClass = (value: unknown): string => {
  if (value === null) return 'text-base-content/50';
  switch (typeof value) {
    case 'number':
    case 'boolean':
      return 'text-warning';
    case 'string':
      return 'text-success';
    default:
      return 'text-primary';
  }
};

const JsonNode: FC<{
  node: unknown;
  label?: string;
  defaultExpanded: boolean;
}> = ({ node, label, defaultExpanded }) => {
  const [open, setOpen] = useState(defaultExpanded);
  const isArray = Array.isArray(node);
  const isObject = node !== null && typeof node === 'object';

  if (!isObject) {
    return (
      <div className="flex gap-1.5">
        {label && <span className="text-base-content/50">{label}:</span>}
        <span className={typeClass(node)}>{JSON.stringify(node)}</span>
      </div>
    );
  }

  const entries: [string, unknown][] = isArray
    ? (node as unknown[]).map((value, index) => [String(index), value])
    : Object.entries(node as Record<string, unknown>);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="text-base-content/70 hover:text-base-content flex items-center gap-1.5">
        <span className="inline-block w-3">{open ? '▾' : '▸'}</span>
        {label && <span className="text-base-content/50">{label}:</span>}
        <span className="text-base-content/50">
          {isArray ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </button>
      {open && (
        <div className="border-base-content/10 ml-4 flex flex-col gap-0.5 border-l pl-2">
          {entries.map(([key, value]) => (
            <JsonNode
              key={key}
              label={key}
              node={value}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const JsonViewer: FC<JsonViewerProps> = ({
  data,
  name,
  defaultExpanded = false,
  className = '',
}) => (
  <div
    role="tree"
    className={`bg-base-200 rounded-xl p-3 font-mono text-xs ${className}`}>
    <JsonNode node={data} label={name} defaultExpanded={defaultExpanded} />
  </div>
);

JsonViewer.displayName = 'JsonViewer';
