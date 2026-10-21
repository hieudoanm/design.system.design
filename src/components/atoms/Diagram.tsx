'use client';

import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

const getTheme = (): 'neutral' | 'dark' => {
  if (typeof document === 'undefined') return 'neutral';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'neutral';
};

const resolve = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(name).trim();
  return value || '';
};

const Diagram: FC<{ chart: string; title?: string }> = ({ chart, title }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'neutral' | 'dark'>(getTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;

    const ink = resolve('--color-ink') || '#111827';
    const mute = resolve('--color-mute') || '#566070';
    const rule = resolve('--color-rule') || '#cfd6df';
    const paper = resolve('--color-paper') || '#f2f4f1';
    const card = resolve('--card-bg') || paper;
    const cobalt = resolve('--color-cobalt') || '#1f4fd8';
    const marker = resolve('--color-marker') || '#c2255c';

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'var(--font-sans)',
      themeVariables: {
        background: 'transparent',
        primaryColor: card,
        primaryTextColor: ink,
        primaryBorderColor: rule,
        secondaryColor: marker,
        tertiaryColor: paper,
        mainBkg: card,
        nodeBorder: cobalt,
        nodeTextColor: ink,
        lineColor: mute,
        textColor: ink,
        titleColor: ink,
        edgeLabelBackground: paper,
        clusterBkg: 'transparent',
        clusterBorder: rule,
        fontFamily: 'var(--font-sans)',
      },
    });

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch(() => {
        if (!cancelled && ref.current) ref.current.textContent = chart;
      });
    return () => {
      cancelled = true;
    };
  }, [chart, theme]);

  return (
    <figure>
      {title && <figcaption className='text-mute mb-2 text-sm font-medium'>{title}</figcaption>}
      <div
        ref={ref}
        className='mermaid overflow-x-auto rounded-md border border-[var(--color-rule)] bg-[var(--card-bg)] p-5 [&_svg]:mx-auto [&_svg]:max-w-full'
      />
    </figure>
  );
};

export default Diagram;
