import { withBasePath } from '@/lib/paths';
import { Fragment, type FC } from 'react';

/** Renders the inline markup: `code`, **bold** and [label](href). */
const inline = (text: string) =>
  text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part, key) => {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={key}
          className='rounded bg-[var(--code-bg)]/[0.12] px-1.5 py-0.5 font-mono text-[0.86em]'>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a
          key={key}
          href={withBasePath(link[2])}
          className='decoration-ink/30 hover:decoration-ink underline underline-offset-2 transition'>
          {link[1]}
        </a>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });

/**
 * Renders plain strings with three bits of inline markup:
 *   `code`, **bold** and [label](href)
 * Blank lines separate paragraphs. A block whose lines all start with
 * "- " is rendered as a bullet list.
 */
const Rich: FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  return (
    <>
      {text.split('\n\n').map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={i} className={`list-disc space-y-1.5 pl-5 ${className}`.trim()}>
              {lines.map((line, j) => (
                <li key={j}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={className}>
            {inline(lines.join(' '))}
          </p>
        );
      })}
    </>
  );
};

export default Rich;
