import type { FC } from 'react';

const Section: FC<{
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}> = ({ id, title, intro, children }) => {
  return (
    <section id={id} className='border-ink/15 border-t py-14 first:border-t-0 first:pt-0'>
      <h2 className='max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl'>{title}</h2>
      {intro && <p className='text-mute mt-3 max-w-2xl text-lg leading-relaxed'>{intro}</p>}
      <div className='mt-8'>{children}</div>
    </section>
  );
};

export default Section;
