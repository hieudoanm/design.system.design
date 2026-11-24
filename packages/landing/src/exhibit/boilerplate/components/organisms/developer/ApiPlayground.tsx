'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface ApiPlaygroundProps {
  title?: string;
  onSend?: (request: { method: string; path: string; body?: string }) => void;
}

const methods = ['GET', 'POST', 'PUT', 'DELETE'];

export const ApiPlayground: FC<ApiPlaygroundProps> = ({
  title = 'API Playground',
  onSend,
}) => {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/v1/users');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const send = () => {
    const request = { method, path, body };
    onSend?.(request);
    setResponse(`${method} ${path} — 200 OK`);
  };

  return (
    <section className="card bg-base-200 border-base-content/10 rounded-xl border">
      <div className="card-body">
        <h2 className="card-title text-base">{title}</h2>
        <div
          className="tabs tabs-boxed w-fit"
          role="tablist"
          aria-label="HTTP method">
          {methods.map((value) => (
            <button
              key={value}
              role="tab"
              aria-selected={method === value}
              className={`tab ${method === value ? 'tab-active' : ''}`}
              onClick={() => setMethod(value)}>
              {value}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="bg-base-100 border-base-content/10 flex items-center rounded-xl border px-3 font-mono text-sm">
            {method}
          </span>
          <input
            aria-label="Request path"
            data-testid="api-path"
            className="input input-bordered input-sm w-full font-mono"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </div>
        <textarea
          aria-label="Request body"
          className="textarea textarea-bordered textarea-sm h-20 font-mono text-sm"
          value={body}
          placeholder="{ }"
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          data-testid="api-send"
          className="btn btn-primary btn-sm mt-2 w-fit"
          onClick={send}>
          Send request
        </button>
        <div className="mockup-window mt-2">
          <pre className="min-h-16 overflow-x-auto p-4 text-sm">
            {response ?? 'Response will appear here.'}
          </pre>
        </div>
      </div>
    </section>
  );
};
