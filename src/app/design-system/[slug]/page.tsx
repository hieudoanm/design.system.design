import Code from '@/components/atoms/Code';
import Rich from '@/components/atoms/Rich';
import Section from '@/components/molecules/Section';
import { getTopic, topics } from '@/content/design-system';
import { withBasePath } from '@/lib/paths';
import type { Metadata, NextPage } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Params = { slug: string };

export const generateStaticParams: () => Params[] = () => {
  return topics.map((topic) => ({ slug: topic.slug }));
};

export const generateMetadata: ({
  params,
}: {
  params: Promise<Params>;
}) => Promise<Metadata> = async ({ params }) => {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return {
    title: topic.title,
    description: topic.tagline,
    alternates: { canonical: withBasePath(`/design-system/${slug}`) },
  };
};

const DesignSystemTopicPage: NextPage<{ params: Promise<Params> }> = async ({ params }) => {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const index = topics.findIndex((t) => t.slug === slug);
  const prev = topics[(index - 1 + topics.length) % topics.length];
  const next = topics[(index + 1) % topics.length];

  return (
    <div className='grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]'>
      <aside className='hidden lg:block'>
        <nav aria-label='On this page' className='sticky top-28'>
          <Link
            href='/design-system'
            className='text-marker font-mono text-xs tracking-[0.2em] uppercase hover:underline'>
            ← All chapters
          </Link>
          <ul className='border-ink/15 mt-5 space-y-2 border-l pl-4 text-sm'>
            {topic.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className='text-mute hover:text-marker transition'>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <article className='min-w-0'>
        <header className='pb-14'>
          <p className='text-marker font-mono text-sm tracking-[0.2em] uppercase'>
            Design System · {index + 1} of {topics.length}
          </p>
          <h1 className='mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl'>
            {topic.title}
          </h1>
          <p className='text-mute mt-6 max-w-2xl text-xl leading-relaxed'>{topic.tagline}</p>
        </header>

        {topic.sections.map((section) => (
          <Section key={section.id} id={section.id} title={section.title} intro={section.intro}>
            <div className='grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
              <div className='text-ink/85 space-y-5 text-[1.0625rem] leading-relaxed'>
                {section.body && <Rich text={section.body} />}

                {section.items && (
                  <dl className='grid gap-x-10 gap-y-8 sm:grid-cols-2'>
                    {section.items.map((item) => (
                      <div key={item.title}>
                        <dt className='text-lg font-semibold'>{item.title}</dt>
                        <dd className='text-ink/80 mt-1 leading-relaxed'>
                          <Rich text={item.body} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.examples && (
                  <div>
                    <h3 className='text-marker font-mono text-xs tracking-[0.2em] uppercase'>
                      Examples
                    </h3>
                    <ul className='mt-2 list-disc space-y-1 pl-5'>
                      {section.examples.map((example) => (
                        <li key={example}>
                          <Rich text={example} className='inline' />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.rules && (
                  <div>
                    <h3 className='text-marker font-mono text-xs tracking-[0.2em] uppercase'>
                      Rules
                    </h3>
                    <ul className='mt-2 list-disc space-y-1 pl-5'>
                      {section.rules.map((rule) => (
                        <li key={rule}>
                          <Rich text={rule} className='inline' />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {section.code && <Code label={section.code.label}>{section.code.source}</Code>}
            </div>
          </Section>
        ))}

        <nav className='border-ink/15 mt-12 flex items-center justify-between border-t pt-6'>
          <Link
            href={`/design-system/${prev.slug}`}
            className='group hover:text-marker flex flex-col transition'>
            <span className='text-mute font-mono text-xs tracking-[0.2em] uppercase'>Previous</span>
            <span className='mt-1 text-lg font-semibold'>{prev.title}</span>
          </Link>
          <Link href='/design-system' className='text-mute hover:text-ink text-sm transition'>
            Back to chapters
          </Link>
          <Link
            href={`/design-system/${next.slug}`}
            className='group hover:text-marker flex flex-col text-right transition'>
            <span className='text-mute font-mono text-xs tracking-[0.2em] uppercase'>Next</span>
            <span className='mt-1 text-lg font-semibold'>{next.title}</span>
          </Link>
        </nav>
      </article>
    </div>
  );
};

export default DesignSystemTopicPage;
