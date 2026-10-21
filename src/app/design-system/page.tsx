import { topics } from '@/content/design-system';
import { withBasePath } from '@/lib/paths';
import type { Metadata, NextPage } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Design System',
  description:
    'How to build a good design system: atomic design, tokens, typography, charts, accessibility and responsive design.',
  alternates: { canonical: withBasePath('/design-system') },
};

const DesignSystemPage: NextPage = () => {
  return (
    <div>
      <header className='pb-14'>
        <p className='text-marker font-mono text-sm tracking-[0.2em] uppercase'>Design System</p>
        <h1 className='mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl'>
          Build it in layers, from tokens to pages.
        </h1>
        <p className='text-mute mt-6 max-w-2xl text-xl leading-relaxed'>
          A design system is a set of tokens, components and guidelines that lets many people build
          a consistent product quickly. These six chapters cover the layers it is built from and the
          concerns that keep it healthy.
        </p>
      </header>

      <section aria-labelledby='topics' className='border-ink/15 border-t py-12'>
        <h2 id='topics' className='text-3xl font-semibold tracking-tight'>
          Chapters
        </h2>
        <ul className='mt-8 grid gap-5 md:grid-cols-2'>
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/design-system/${topic.slug}`}
                className='hover:border-marker border-ink/15 flex h-full flex-col justify-between rounded-lg border bg-white/60 p-6 transition hover:-translate-y-1 hover:shadow-xl'>
                <div>
                  <h3 className='text-2xl font-semibold tracking-tight'>{topic.title}</h3>
                  <p className='text-mute mt-2 leading-relaxed'>{topic.tagline}</p>
                </div>
                <ul className='mt-5 flex flex-wrap gap-2'>
                  {topic.sections.map((section) => (
                    <li
                      key={section.id}
                      className='text-marker bg-marker/10 rounded-full px-2.5 py-0.5 font-mono text-xs'>
                      {section.title}
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DesignSystemPage;
