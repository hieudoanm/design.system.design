'use client';

import { framework, problemGroups, problemsByGroup } from '@/content/ts/system-design';
import type { NextPage } from 'next';
import type { Difficulty, Problem } from '@/content/ts/system-design/types';
import { TopicIndexTemplate } from '@/components/templates/TopicsTemplate';

const difficultyStyle: Record<Difficulty, string> = {
  Easy: 'bg-emerald-600/10 text-emerald-700',
  Medium: 'bg-amber-500/15 text-amber-700',
  Hard: 'bg-rose-600/10 text-rose-700',
};

const style = {
  eyebrowClass: 'text-cobalt',
  hoverBorderClass: 'hover:border-cobalt',
  badgeTextClass: 'text-cobalt',
  badgeBgClass: 'bg-cobalt/10',
  tagClass: 'bg-cobalt/10 text-cobalt rounded-full px-2.5 py-0.5 font-mono text-xs',
  eyebrowColorClass: 'text-cobalt',
} as const;

interface AdaptedProblem {
  slug: string;
  title: string;
  tagline: string;
  sections: readonly { id: string; title: string }[];
  tags: string[];
  difficulty: Difficulty;
}

const problemToIndexItem = (problem: Problem): AdaptedProblem => ({
  slug: problem.slug,
  title: problem.title,
  tagline: problem.tagline,
  sections: problem.design.map((block) => ({
    id: block.title.toLowerCase().replace(/\s+/g, '-'),
    title: block.title,
  })),
  tags: problem.tags,
  difficulty: problem.difficulty,
});

const SystemDesignPage: NextPage = () => (
  <TopicIndexTemplate
    header={{
      eyebrow: 'System Design',
      title: 'Popular problems, with the questions interviewers ask next.',
      description:
        'Twenty-four problems in six groups of four. Each one walks through requirements, rough numbers, a diagram, the key design choices, and a list of follow-up questions with answers.',
    }}
    groups={problemGroups}
    itemsByGroup={(groupId) => problemsByGroup(groupId).map(problemToIndexItem)}
    basePath='/system-design'
    style={style}
    itemLabel={{ singular: 'problem', plural: 'problems' }}
    eyebrowClass='text-cobalt'
    color='cobalt'
    renderTitleAccessory={(item) => {
      const adapted = item as AdaptedProblem;
      return <span className={difficultyStyle[adapted.difficulty]}>{adapted.difficulty}</span>;
    }}
    footer={
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
    }
  />
);

export default SystemDesignPage;
