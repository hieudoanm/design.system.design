import Figure from '@/components/atoms/Figure';
import type { TopicVisual } from '@/content/design-system';
import type { FC } from 'react';

/** A grid of drawn examples. Each figure spans one column unless it is `full`. */
const Figures: FC<{ visuals: TopicVisual[] }> = ({ visuals }) => {
  return (
    <div className='mt-10 grid gap-6 xl:grid-cols-2'>
      {visuals.map((visual) => (
        <div key={visual.title} className={visual.full ? 'xl:col-span-2' : undefined}>
          <Figure
            title={visual.title}
            caption={visual.caption}
            svg={visual.svg}
            table={visual.table}
            minWidth={visual.minWidth}
            maxWidth={visual.maxWidth}
          />
        </div>
      ))}
    </div>
  );
};

export default Figures;
