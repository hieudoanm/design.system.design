import { createHighlighterCoreSync, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import langTs from 'shiki/langs/typescript.mjs';
import langTsx from 'shiki/langs/tsx.mjs';
import langCss from 'shiki/langs/css.mjs';
import langHtml from 'shiki/langs/html.mjs';
import langJson from 'shiki/langs/json.mjs';
import langBash from 'shiki/langs/bash.mjs';
import langMd from 'shiki/langs/markdown.mjs';
import themeDark from 'shiki/themes/github-dark.mjs';

/*
 * The highlighter is built once, at module load, with the JavaScript regex
 * engine. That keeps it fully synchronous — no WASM, no async, nothing the
 * static export and the jsdom unit tests cannot do — while still giving real
 * per-token highlighting at build time.
 */
const highlighter: HighlighterCore = createHighlighterCoreSync({
  themes: [themeDark, themeDark],
  langs: [langTs, langTsx, langCss, langHtml, langJson, langBash, langMd],
  engine: createJavaScriptRegexEngine(),
});

/** Map a code block's label (a file name) to a shiki language id. */
const languageFor = (label?: string): string => {
  if (!label) return 'text';
  const extension = label.slice(label.lastIndexOf('.') + 1).toLowerCase();
  const byExtension: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'typescript',
    jsx: 'tsx',
    mjs: 'typescript',
    mts: 'typescript',
    css: 'css',
    html: 'html',
    json: 'json',
    sh: 'bash',
    bash: 'bash',
    md: 'markdown',
  };
  return byExtension[extension] ?? 'text';
};

/** A block of monospaced text: code samples and ASCII architecture diagrams. */
const Code = ({ children, label }: { children: string; label?: string }) => {
  const html = highlighter.codeToHtml(children, {
    lang: languageFor(label),
    themes: { light: 'github-dark', dark: 'github-dark' },
    defaultColor: false,
  });

  return (
    <figure>
      {label && <figcaption className='text-mute mb-2 text-sm font-medium'>{label}</figcaption>}
      <div
        className='shiki-block overflow-x-auto rounded-md bg-[var(--code-bg)] p-5 font-mono text-[13px] leading-6'
        // Shiki output is generated from the block's own text, not user HTML.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
};

export default Code;
