import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import IndexCard from '@/components/molecules/IndexCard';

/** Minimal group shape required by the template. */
export interface IndexGroup<TGroupId extends string = string> {
  id: TGroupId;
  title: string;
  intro: string;
}

/** Minimal item shape required by the template. */
export interface IndexItem {
  slug: string;
  title: string;
  tagline: string;
  /** Section titles displayed as badges on the card. */
  sections: readonly { id: string; title: string }[];
  /** Optional tags (used by system-design problems). */
  tags?: readonly string[];
}

/** Style configuration for a specific index page. */
export interface IndexStyleConfig {
  /** CSS class for the eyebrow text (e.g., 'text-marker', 'text-cobalt'). */
  eyebrowClass: string;
  /** CSS class for the card hover border (e.g., 'hover:border-marker', 'hover:border-cobalt'). */
  hoverBorderClass: string;
  /** CSS class for the section badge text (e.g., 'text-marker', 'text-cobalt'). */
  badgeTextClass: string;
  /** CSS class for the section badge background (e.g., 'bg-marker/10', 'bg-cobalt/10'). */
  badgeBgClass: string;
  /** CSS class for item tags (system-design uses cobalt, design-system uses marker). */
  tagClass: string;
  /** CSS class for the eyebrow text color (uppercase label). */
  eyebrowColorClass: string;
}

/** Props for the TopicsTemplate component. */
export interface TopicsTemplateProps<TGroup extends IndexGroup<string>, TItem extends IndexItem> {
  /** Page metadata is handled by the page itself; this is for the visible header. */
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  /** Groups in display order. */
  groups: readonly TGroup[];
  /** Function to get items for a group. */
  itemsByGroup: (groupId: TGroup['id']) => readonly TItem[];
  /** Base URL path for item links (e.g., '/design-system', '/system-design'). */
  basePath: string;
  /** Style configuration for theming. */
  style: IndexStyleConfig;
  /** Singular/plural label for item count (e.g., 'chapter'/'chapters', 'problem'/'problems'). */
  itemLabel: { singular: string; plural: string };
  /** Render function for extra content in the card title area (e.g., difficulty badge for system-design). */
  renderTitleAccessory?: (item: IndexItem) => ReactNode;
  /** Optional footer section rendered after all groups. */
  footer?: ReactNode;
  /** CSS class for the eyebrow label (uppercase category name). Defaults to style.eyebrowColorClass. */
  eyebrowClass?: string;
  /** Color theme for animations. */
  color: 'marker' | 'cobalt';
}

/**
 * Generic index page template for displaying grouped items in a card grid.
 * Used by both Design System and System Design index pages.
 */
export const TopicIndexTemplate = <TGroup extends IndexGroup<string>, TItem extends IndexItem>({
  header,
  groups,
  itemsByGroup,
  basePath,
  style,
  itemLabel,
  renderTitleAccessory,
  footer,
  eyebrowClass,
  color,
}: TopicsTemplateProps<TGroup, TItem>) => {
  return (
    <div>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='pb-14'>
        <p
          className={`${eyebrowClass ?? style.eyebrowColorClass} font-mono text-sm tracking-[0.2em] uppercase`}>
          {header.eyebrow}
        </p>
        <h1 className='mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl'>
          {header.title}
        </h1>
        <p className='text-mute mt-6 max-w-2xl text-xl leading-relaxed'>{header.description}</p>
      </motion.header>

      {groups.map((group, groupIndex) => {
        const groupItems = itemsByGroup(group.id);

        return (
          <motion.section
            key={group.id}
            aria-labelledby={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + groupIndex * 0.1 }}
            className='border-ink/15 border-t py-12'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <h2 id={group.id} className='text-3xl font-semibold tracking-tight'>
                {group.title}
              </h2>
              <p className='text-mute font-mono text-sm'>
                {groupItems.length}{' '}
                {groupItems.length === 1 ? itemLabel.singular : itemLabel.plural}
              </p>
            </div>
            <p className='text-mute mt-2 max-w-2xl leading-relaxed'>{group.intro}</p>
            <ul className='mt-8 grid gap-5 md:grid-cols-2'>
              {groupItems.map((item, itemIndex) => (
                <IndexCard
                  key={item.slug}
                  item={item}
                  basePath={basePath}
                  style={style}
                  renderTitleAccessory={renderTitleAccessory}
                  index={groupIndex * 4 + itemIndex}
                  color={color}
                />
              ))}
            </ul>
          </motion.section>
        );
      })}

      {footer && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + groups.length * 0.1 }}
          aria-labelledby='framework'
          className='border-ink/15 border-t py-12'>
          {footer}
        </motion.section>
      )}
    </div>
  );
};
