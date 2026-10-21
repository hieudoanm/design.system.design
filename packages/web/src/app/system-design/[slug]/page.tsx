import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import { TopicTemplate } from '@/components/templates/TopicTemplate';
import { getProblem, problems } from '@/content/ts/system-design';
import type { TopicSectionData } from '@/content/ts/types';
import { withBasePath } from '@/lib/paths';

type Params = { slug: string };

/** "an" before a vowel sound: an API gateway. A URL and a unique id take "a". */
const article = (title: string) =>
  /^[aeiou]/i.test(title) && !/^u(rl|nique|ser)/i.test(title) ? 'an' : 'a';

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

  const sections: TopicSectionData[] = [
    {
      id: 'requirements',
      title: 'Requirements',
      intro: 'What the system must do, and how well it must do it.',
      blocks: [
        { type: 'list', title: 'Functional', items: problem.functional },
        { type: 'list', title: 'Non-functional', items: problem.nonFunctional },
      ],
    },
    {
      id: 'estimation',
      title: 'Estimation',
      intro: 'Back of the envelope numbers that drive the design.',
      blocks: [{ type: 'list', items: problem.estimation }],
    },
    {
      id: 'architecture',
      title: 'Architecture',
      blocks: [
        {
          type: 'diagram',
          label: 'High-level design',
          source: problem.diagram,
        },
      ],
    },
    {
      id: 'design',
      title: 'Design decisions',
      blocks: [{ type: 'items', items: problem.design }],
    },
    {
      id: 'questions',
      title: 'Questions and answers',
      intro: 'Follow-ups an interviewer is likely to ask. Try answering before you open each one.',
      blocks: [{ type: 'qa', items: problem.qa }],
    },
  ];

  return (
    <TopicTemplate
      theme='system-design'
      category={`System Design · ${problem.difficulty}`}
      title={`Design ${article(problem.title)} ${problem.title.toLowerCase()}`}
      tagline={problem.tagline}
      sections={sections}
      backLink={{ href: '/system-design', label: 'All problems' }}
      footer={{
        next: { href: `/system-design/${next.slug}`, title: next.title, label: 'Next problem' },
      }}
    />
  );
};

export default ProblemPage;
