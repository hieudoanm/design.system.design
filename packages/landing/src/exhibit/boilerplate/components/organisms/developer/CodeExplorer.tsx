'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface FileNode {
  path: string;
  content: string;
  language?: string;
}

interface CodeExplorerProps {
  files: FileNode[];
  title?: string;
}

export const CodeExplorer: FC<CodeExplorerProps> = ({
  files,
  title = 'Explorer',
}) => {
  const [activePath, setActivePath] = useState(files[0]?.path ?? '');

  const active = files.find((file) => file.path === activePath) ?? files[0];

  return (
    <div className="border-base-content/10 flex flex-col overflow-hidden rounded-xl border md:flex-row">
      <aside className="bg-base-200 border-base-content/10 w-full border-b p-3 md:w-64 md:border-r md:border-b-0">
        <h3 className="mb-2 text-sm font-medium">{title}</h3>
        <nav className="flex flex-col gap-1">
          {files.map((file) => (
            <button
              key={file.path}
              data-testid="code-file"
              className={`btn btn-sm justify-start ${
                file.path === activePath ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setActivePath(file.path)}>
              <span aria-hidden="true">📄</span>
              {file.path}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-4">
        {active ? (
          <div data-testid="code-content">
            <header className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium">{active.path}</h4>
              {active.language && (
                <span className="badge badge-ghost badge-sm">
                  {active.language}
                </span>
              )}
            </header>
            <div className="mockup-code">
              {active.content.split('\n').map((line, index) => (
                <pre key={index} data-prefix={index + 1}>
                  <code>{line || ' '}</code>
                </pre>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-base-content/50">No files.</p>
        )}
      </div>
    </div>
  );
};
