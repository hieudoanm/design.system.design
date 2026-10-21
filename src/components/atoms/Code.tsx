import type { FC } from 'react';

/** A block of monospaced text: code samples and ASCII architecture diagrams. */
const Code: FC<{ children: string; label?: string }> = ({ children, label }) => {
  return (
    <figure>
      {label && <figcaption className='text-mute mb-2 text-sm font-medium'>{label}</figcaption>}
      <pre className='overflow-x-auto rounded-md bg-[var(--code-bg)] p-5 font-mono text-[13px] leading-6 text-[var(--code-fg)]'>
        <code>{children}</code>
      </pre>
    </figure>
  );
};

export default Code;
