import type { FC } from 'react';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: string;
}

interface TestRunnerProps {
  results: TestResult[];
  title?: string;
}

const statusClass: Record<string, string> = {
  passed: 'badge-success',
  failed: 'badge-error',
  skipped: 'badge-neutral',
};

const statusIcon: Record<string, string> = {
  passed: '✓',
  failed: '✕',
  skipped: '−',
};

export const TestRunner: FC<TestRunnerProps> = ({
  results,
  title = 'Test runner',
}) => {
  const passed = results.filter((result) => result.status === 'passed').length;
  const failed = results.filter((result) => result.status === 'failed').length;

  return (
    <section className="py-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl">{title}</h2>
        <div className="flex gap-2">
          <span className="badge badge-success">{passed} passed</span>
          <span className="badge badge-error">{failed} failed</span>
          <span className="badge badge-ghost">{results.length} total</span>
        </div>
      </header>
      <ul className="bg-base-200 border-base-content/10 flex flex-col rounded-xl border">
        {results.length === 0 && (
          <li className="text-base-content/50 p-4 text-sm">No tests run.</li>
        )}
        {results.map((result) => (
          <li
            key={result.id}
            className="border-base-content/10 flex items-center gap-3 border-b p-3 last:border-b-0">
            <span
              aria-hidden="true"
              className={`${
                result.status === 'passed'
                  ? 'text-success'
                  : result.status === 'failed'
                    ? 'text-error'
                    : 'text-base-content/40'
              }`}>
              {statusIcon[result.status]}
            </span>
            <p className="font-mono text-sm">{result.name}</p>
            <div className="ml-auto flex items-center gap-2">
              {result.duration && (
                <span className="text-base-content/40 text-xs">
                  {result.duration}
                </span>
              )}
              <span
                className={`badge badge-sm ${
                  statusClass[result.status] ?? 'badge-ghost'
                }`}>
                {result.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
