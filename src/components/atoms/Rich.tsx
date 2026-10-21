import { withBasePath } from '@/lib/paths';
import { Fragment, type FC } from 'react';

/**
 * Renders plain strings with three bits of inline markup:
 *   `code`, **bold** and [label](href)
 * Blank lines separate paragraphs.
 */
const Rich: FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  return (
    <>
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} className={className}>
          {paragraph.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part, j) => {
            if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
              return (
                <code
                  key={j}
                  className='bg-ink/[0.07] rounded px-1.5 py-0.5 font-mono text-[0.86em]'>
                  {part.slice(1, -1)}
                </code>
              );
            }
            if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
            if (link) {
              return (
                <a
                  key={j}
                  href={withBasePath(link[2])}
                  className='decoration-ink/30 hover:decoration-ink underline underline-offset-2 transition'>
                  {link[1]}
                </a>
              );
            }
            return <Fragment key={j}>{part}</Fragment>;
          })}
        </p>
      ))}
    </>
  );
};

export default Rich;
