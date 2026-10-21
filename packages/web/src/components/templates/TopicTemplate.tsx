import Link from 'next/link';
import type { FC } from 'react';
import Code from '@/components/atoms/Code';
import Diagram from '@/components/atoms/Diagram';
import Rich from '@/components/atoms/Rich';
import Figures from '@/components/molecules/Figures';
import Qa from '@/components/molecules/Qa';
import Section from '@/components/molecules/Section';
import type { TopicBlock, TopicPageData, TopicSectionData, TopicTheme } from '@/content/ts/types';

const accentText: Record<TopicTheme, string> = {
  'system-design': 'text-cobalt',
  'design-system': 'text-marker',
};

const accentHover: Record<TopicTheme, string> = {
  'system-design': 'hover:text-cobalt',
  'design-system': 'hover:text-marker',
};

const ListBlock: FC<{ title?: string; items: string[]; theme: TopicTheme }> = ({
  title,
  items,
  theme,
}) => (
  <div>
    {title && (
      <h3 className={`${accentText[theme]} font-mono text-xs tracking-[0.2em] uppercase`}>
        {title}
      </h3>
    )}
    <ul
      className={`${title ? 'mt-2' : ''} list-disc space-y-2 pl-5 text-[1.0625rem] leading-relaxed`}>
      {items.map((item) => (
        <li key={item}>
          <Rich text={item} className='inline' />
        </li>
      ))}
    </ul>
  </div>
);

const Block: FC<{ block: TopicBlock; theme: TopicTheme }> = ({ block, theme }) => {
  switch (block.type) {
    case 'prose':
      return (
        <div className='text-ink/85 max-w-3xl space-y-3 text-[1.0625rem] leading-relaxed'>
          <Rich text={block.text} />
        </div>
      );
    case 'code':
      return <Code label={block.label}>{block.source}</Code>;
    case 'diagram':
      return <Diagram chart={block.source} title={block.label} />;
    case 'list':
      return <ListBlock title={block.title} items={block.items} theme={theme} />;
    case 'examples':
      return <ListBlock title='Examples' items={block.examples} theme={theme} />;
    case 'rules':
      return <ListBlock title='Rules' items={block.rules} theme={theme} />;
    case 'items':
      return (
        <div className='space-y-10'>
          {block.items.map((item) => (
            <div key={item.title} className='max-w-3xl'>
              <h3 className='text-2xl font-semibold tracking-tight'>{item.title}</h3>
              <div className='text-ink/85 mt-3 space-y-3 text-[1.0625rem] leading-relaxed'>
                <Rich text={item.body} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'qa':
      return <Qa items={block.items} />;
    case 'visuals':
      return <Figures visuals={block.visuals} />;
  }
};

export type TopicSection = TopicSectionData;

export type TopicTemplateProps = TopicPageData;

export const TopicTemplate: FC<TopicTemplateProps> = ({
  theme,
  category,
  title,
  tagline,
  sections,
  backLink,
  footer,
}) => {
  const accent = accentText[theme];
  const hover = accentHover[theme];

  return (
    <div className='grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]'>
      <aside className='hidden lg:block'>
        <nav aria-label='On this page' className='sticky top-28'>
          <Link
            href={backLink.href}
            className={`${accent} font-mono text-xs tracking-[0.2em] uppercase hover:underline`}>
            ← {backLink.label}
          </Link>
          <ul className='border-ink/15 mt-5 space-y-2 border-l pl-4 text-sm'>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className={`text-mute ${hover} transition`}>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <article className='min-w-0'>
        <header className='pb-14'>
          <p className={`${accent} font-mono text-sm tracking-[0.2em] uppercase`}>{category}</p>
          <h1 className='mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl'>
            {title}
          </h1>
          <p className='text-mute mt-6 max-w-2xl text-xl leading-relaxed'>{tagline}</p>
        </header>

        {sections.map((section) => (
          <Section key={section.id} id={section.id} title={section.title} intro={section.intro}>
            <div className='space-y-8'>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} theme={theme} />
              ))}
            </div>
          </Section>
        ))}

        {footer && (
          <nav className='border-ink/15 mt-12 flex items-center justify-between border-t pt-6'>
            {footer.prev && (
              <Link href={footer.prev.href} className={`group ${hover} flex flex-col transition`}>
                <span className='text-mute font-mono text-xs tracking-[0.2em] uppercase'>
                  {footer.prev.label ?? 'Previous'}
                </span>
                <span className='mt-1 text-lg font-semibold'>{footer.prev.title}</span>
              </Link>
            )}

            {footer.backToIndex && (
              <Link
                href={footer.backToIndex.href}
                className='text-mute hover:text-ink text-sm transition'>
                {footer.backToIndex.label}
              </Link>
            )}

            {footer.next && (
              <Link
                href={footer.next.href}
                className={`group ${hover} flex flex-col text-right transition`}>
                <span className='text-mute font-mono text-xs tracking-[0.2em] uppercase'>
                  {footer.next.label ?? 'Next'}
                </span>
                <span className='mt-1 text-lg font-semibold'>{footer.next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>
    </div>
  );
};

export default TopicTemplate;
