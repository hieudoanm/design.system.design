import type { Metadata, NextPage } from 'next';
import Link from 'next/link';
import { framework, problems } from '@/content/ts/system-design';
import type { Difficulty } from '@/content/ts/system-design/types';
import { withBasePath } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'System Design',
  description:
    'Popular system design interview problems with requirements, estimates, architecture and questions with answers.',
  alternates: { canonical: withBasePath('/system-design') },
};

const difficultyStyle: Record<Difficulty, string> = {
  Easy: 'bg-emerald-600/10 text-emerald-700',
  Medium: 'bg-amber-500/15 text-amber-700',
  Hard: 'bg-rose-600/10 text-rose-700',
};

const SystemDesignPage: NextPage = () => {
  return (
    <div>
      <header className='pb-14'>
        <p className='text-cobalt font-mono text-sm tracking-[0.2em] uppercase'>System Design</p>
        <h1 className='mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl'>
          Popular problems, with the questions interviewers ask next.
        </h1>
        <p className='text-mute mt-6 max-w-2xl text-xl leading-relaxed'>
          Each problem walks through requirements, rough numbers, a diagram, the key design choices,
          and a list of follow-up questions with answers.
        </p>
      </header>

      <section aria-labelledby='problems' className='border-ink/15 border-t py-12'>
        <h2 id='problems' className='text-3xl font-semibold tracking-tight'>
          Problems
        </h2>
        <ul className='mt-8 grid gap-5 md:grid-cols-2'>
          {problems.map((problem) => (
            <li key={problem.slug}>
              <Link
                href={`/system-design/${problem.slug}`}
                className='border-ink/15 hover:border-cobalt flex h-full flex-col justify-between rounded-lg border bg-[var(--card-bg)] p-6 transition hover:-translate-y-1 hover:shadow-xl'>
                <div>
                  <div className='flex items-center justify-between gap-3'>
                    <h3 className='text-2xl font-semibold tracking-tight'>{problem.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${difficultyStyle[problem.difficulty]}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className='text-mute mt-2 leading-relaxed'>{problem.tagline}</p>
                </div>
                <ul className='mt-5 flex flex-wrap gap-2'>
                  {problem.tags.map((tag) => (
                    <li
                      key={tag}
                      className='bg-cobalt/10 text-cobalt rounded-full px-2.5 py-0.5 font-mono text-xs'>
                      {tag}
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby='framework' className='border-ink/15 border-t py-12'>
        <h2 id='framework' className='text-3xl font-semibold tracking-tight'>
          A framework for any question
        </h2>
        <p className='text-mute mt-3 max-w-2xl text-lg'>
          Follow the same six steps every time and you will rarely get lost.
        </p>
        <ol className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {framework.map((item, i) => (
            <li key={item.step} className='border-cobalt border-t-2 pt-4'>
              <p className='text-cobalt font-mono text-sm'>{String(i + 1).padStart(2, '0')}</p>
              <h3 className='mt-1 text-lg font-semibold'>{item.step}</h3>
              <p className='text-ink/80 mt-2 leading-relaxed'>{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default SystemDesignPage;
