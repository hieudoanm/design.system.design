import { topics } from '@/content/ts/design-system';
import { problems } from '@/content/ts/system-design';
import AnimatedCard from '@/components/molecules/AnimatedCard';
import Hero from '@/components/molecules/Hero';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div>
      <Hero />

      <section className='grid gap-6 md:grid-cols-2'>
        <AnimatedCard
          href='/design-system'
          label='Left toggle'
          title='Design System'
          description='A practical guide to building one with atomic design: tokens, atoms, molecules, organisms, templates and pages — plus typography, charts, accessibility and responsive design.'
          items={topics}
          color='marker'
          index={0}
        />
        <AnimatedCard
          href='/system-design'
          label='Right toggle'
          title='System Design'
          description='Popular interview problems, each with requirements, back of the envelope numbers, an architecture diagram, the design decisions and the follow-up questions with answers.'
          items={problems}
          color='cobalt'
          index={1}
        />
      </section>
    </div>
  );
};

export default Home;
