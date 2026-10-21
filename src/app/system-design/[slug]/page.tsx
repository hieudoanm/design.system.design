import type { Metadata, NextPage } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Code from '@/components/atoms/Code';
import Rich from '@/components/atoms/Rich';
import Qa from '@/components/molecules/Qa';
import Section from '@/components/molecules/Section';
import { getProblem, problems } from '@/content/ts/system-design';
import { withBasePath } from '@/lib/paths';

type Params = { slug: string };

export const generateStaticParams: () => Params[] = () => {
  return problems.map((p) => ({ slug: p.slug }));
};

export const generateMetadata: ({
  params,
}: {
  params: Promise<Params>;
}) => Promise<Metadata> = async ({ params }) => {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) return {};
  return {
    title: `Design ${problem.title}`,
    description: problem.tagline,
    alternates: { canonical: withBasePath(`/system-design/${slug}`) },
  };
};

const ProblemPage: NextPage<{ params: Promise<Params> }> = async ({ params }) => {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();

  const index = problems.findIndex((p) => p.slug === slug);
  const next = problems[(index + 1) % problems.length];
  const toc = [
    { id: 'requirements', label: 'Requirements' },
    { id: 'estimation', label: 'Estimation' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'design', label: 'Design decisions' },
    { id: 'questions', label: 'Questions and answers' },
  ];

  return (
    <div className='grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]'>
      <aside className='hidden lg:block'>
        <nav aria-label='On this page' className='sticky top-28'>
          <Link
            href='/system-design'
            className='text-cobalt font-mono text-xs tracking-[0.2em] uppercase hover:underline'>
            ← All problems
          </Link>
          <ul className='border-ink/15 mt-5 space-y-2 border-l pl-4 text-sm'>
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className='text-mute hover:text-cobalt transition'>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <article className='min-w-0'>
        <header className='pb-14'>
          <p className='text-cobalt font-mono text-sm tracking-[0.2em] uppercase'>
            System Design · {problem.difficulty}
          </p>
          <h1 className='mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl'>
            Design a {problem.title.toLowerCase()}
          </h1>
          <p className='text-mute mt-6 max-w-2xl text-xl leading-relaxed'>{problem.tagline}</p>
        </header>

        <Section id='requirements' title='Requirements'>
          <div className='grid gap-10 md:grid-cols-2'>
            <div>
              <h3 className='text-cobalt font-mono text-xs tracking-[0.2em] uppercase'>
                Functional
              </h3>
              <ul className='mt-3 list-disc space-y-2 pl-5 leading-relaxed'>
                {problem.functional.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-cobalt font-mono text-xs tracking-[0.2em] uppercase'>
                Non-functional
              </h3>
              <ul className='mt-3 list-disc space-y-2 pl-5 leading-relaxed'>
                {problem.nonFunctional.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section
          id='estimation'
          title='Estimation'
          intro='Back of the envelope numbers that drive the design.'>
          <ul className='max-w-3xl list-disc space-y-2 pl-5 text-[1.0625rem] leading-relaxed'>
            {problem.estimation.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Section>

        <Section id='architecture' title='Architecture'>
          <Code label='High-level design'>{problem.diagram}</Code>
        </Section>

        <Section id='design' title='Design decisions'>
          <div className='space-y-10'>
            {problem.design.map((block) => (
              <div key={block.title} className='max-w-3xl'>
                <h3 className='text-2xl font-semibold tracking-tight'>{block.title}</h3>
                <div className='text-ink/85 mt-3 space-y-3 text-[1.0625rem] leading-relaxed'>
                  <Rich text={block.body} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id='questions'
          title='Questions and answers'
          intro='Follow-ups an interviewer is likely to ask. Try answering before you open each one.'>
          <Qa items={problem.qa} />
        </Section>

        <footer className='border-ink/15 border-t pt-8'>
          <Link href={`/system-design/${next.slug}`} className='group inline-flex flex-col'>
            <span className='text-mute font-mono text-xs tracking-[0.2em] uppercase'>
              Next problem
            </span>
            <span className='group-hover:text-cobalt mt-1 text-2xl font-semibold tracking-tight transition'>
              {next.title} →
            </span>
          </Link>
        </footer>
      </article>
    </div>
  );
};

export default ProblemPage;
