import type { Topic } from '../../index';
import { families, focus, stacking } from './svg-generated';

const overlayDialogTsx = `import { useEffect, useRef } from 'react';

export function Modal({ open, onClose, label, children }: ModalProps) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement;

    // Move focus into the dialog when it opens.
    dialog.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Put focus back where it was when the dialog closes.
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}`;

const overlayCss = `.backdrop {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--color-ink) 45%, transparent);
  z-index: var(--z-index-3);
}

.backdrop > [role='dialog'] {
  position: fixed;
  inset-block-start: 50%;
  inset-inline: auto;
  translate: 0 -50%;
  max-inline-size: 32rem;
  margin-inline: auto;
  background: var(--color-paper);
  box-shadow: var(--shadow-lg);
  border-radius: 0.75rem;
  padding: var(--space-6);
}`;

export const overlays: Topic = {
  slug: 'overlays',
  title: 'Overlays',
  tagline: 'Modals, drawers, popovers, menus and tooltips.',
  summary:
    'An overlay is anything that renders above the page: a modal, a drawer, a popover, a menu or a tooltip. Because they sit on top of everything else, overlays are the components with the strictest rules about focus, dismissal and stacking. Get the family boundaries right and the rest follows.',
  group: 'interaction',
  sections: [
    {
      id: 'philosophy',
      title: 'Overlay philosophy',
      intro: 'The least blocking overlay that still does the job.',
      body: 'Every overlay takes control away from the page, so the first question is whether you need one at all. Reach for the lightest pattern that works: a tooltip over a popover, a popover over a drawer, a drawer over a modal. The heavier the overlay, the more it must justify itself with content the user came to act on. A page that opens a modal for everything trains people to dismiss without reading. A system gets overlays right by naming the families, fixing what each one may do, and keeping the rules the same everywhere.',
      rules: [
        'Choose the lightest overlay that fits; escalate only when you must.',
        'Every overlay is one of a small, named set of families.',
        'Reserve the modal for a decision the user cannot postpone.',
        'Never nest an overlay inside another overlay of the same weight.',
        'One overlay owns the top of the stack at a time.',
      ],
      visuals: [
        {
          title: 'Overlay families',
          caption: 'From blocking to light: modal, drawer, popover, menu and tooltip.',
          svg: families,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'families',
      title: 'The overlay families',
      intro: 'Five families, one job each.',
      body: 'A modal blocks the page until answered and takes a decision. A drawer is a modal anchored to an edge, used for longer tasks or navigation. A popover is anchored to a trigger and dismissed lightly; it may hold a small form or a menu. A menu is a list of actions, opened from a button or a right-click. A tooltip is a label for an existing control, never interactive, never the only place a fact appears. When a new overlay arrives, place it in one of these five before designing anything.',
      examples: [
        'Modal: a destructive confirmation with a cancel and a confirm.',
        'Drawer: a multi-field edit or a settings panel.',
        'Popover: a date picker or a small filter form.',
        'Menu: a row of actions for a record.',
        'Tooltip: the accessible name of an icon button.',
      ],
      rules: [
        'Name the family before designing the instance.',
        'A tooltip never contains an interactive control.',
        'A popover stays anchored; a modal does not.',
        'Menus hold actions, never arbitrary content.',
        'If two families seem to fit, the content is doing too much.',
      ],
    },
    {
      id: 'focus-management',
      title: 'Focus management',
      intro: 'The overlay owns focus while it is open.',
      body: 'Focus is the part teams get wrong. When a blocking overlay opens, focus moves into it; while it is open, Tab cycles only inside it; the rest of the page is made inert so nothing behind it is reachable. When it closes, focus returns to the element that opened it, so the user is not dropped back at the top of the page. Use the native `inert` attribute rather than hiding the background with CSS, because an element that is merely invisible is still focusable.',
      rules: [
        'Move focus into the overlay when it opens.',
        'Trap Tab inside the overlay while it is open.',
        'Set `inert` on the background — do not hide it with `display` alone.',
        'Return focus to the trigger when the overlay closes.',
        'Give the overlay a visible focus style and a discoverable initial target.',
      ],
      code: {
        label: 'Modal.tsx',
        source: overlayDialogTsx,
      },
      visuals: [
        {
          title: 'Focus management in a modal',
          caption: 'Focus enters, cycles inside, and returns to the trigger on close.',
          svg: focus,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'dismissal',
      title: 'Dismissal',
      intro: 'Every overlay closes in a predictable way.',
      body: 'A user must always be able to leave. Blocking overlays close on Escape and on a cancel control; anchored overlays close on Escape, on an outside click and on a second activation of the trigger. Destructive actions need an explicit confirm and must never be the default focus, so a stray Enter does not delete anything. Toasts are the one exception: they dismiss themselves, and they must pause on hover or focus so a slow reader is not robbed of the message.',
      rules: [
        'Escape closes the topmost overlay.',
        'A blocking overlay has an explicit cancel, not just an outside click.',
        'The destructive action is never the initial focus.',
        'Anchored overlays close on outside click and on their trigger.',
        'Auto-dismissing overlays pause on hover and on focus.',
      ],
      code: {
        label: 'overlay.css',
        source: overlayCss,
      },
    },
    {
      id: 'stacking',
      title: 'Stacking and position',
      intro: 'Overlays reuse the elevation z-index scale.',
      body: 'Overlays do not invent z-index values; they draw from the same scale as the rest of the system. A dropdown sits one level above the page, a modal above that, a toast above everything because it is transient. Render overlays into a portal at the top of the document so no ancestor `overflow` or `transform` can clip them, and position anchored overlays with the platform anchor-positioning features where they are available. If an overlay needs a number no other component uses, the scale is wrong, not the overlay.',
      examples: [
        'Dropdown: z-index: var(--z-index-2); box-shadow: var(--shadow-md)',
        'Modal: z-index: var(--z-index-3); box-shadow: var(--shadow-lg)',
        'Toast: z-index: var(--z-index-4); box-shadow: var(--shadow-xl)',
      ],
      rules: [
        'Reuse the elevation z-index scale — never a raw 999.',
        'Portal overlays to the top of the document body.',
        'Prefer `anchor-positioning` over hand-computed coordinates.',
        'A new overlay level means the scale failed.',
        'Keep one overlay on top at a time; do not stack modals on modals.',
      ],
      visuals: [
        {
          title: 'Overlay stacking',
          caption: 'Each overlay pairs a z-index with a proportional shadow.',
          svg: stacking,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      intro: 'An overlay that cannot be operated is a trap.',
      body: 'Overlays carry more accessibility weight than most components because they take over the screen. Use `role="dialog"` with `aria-modal="true"` for blocking overlays, and give each one an accessible name, either from a visible heading via `aria-labelledby` or from `aria-label`. Menus use the menu roles and manage arrow-key movement; tooltips are linked to their trigger with `aria-describedby`. Announce dynamic changes with a polite live region, and honour `prefers-reduced-motion` for the open and close animation.\n\nFor the full accessibility strategy (WCAG 2.2 AA baseline, keyboard, semantics, motion, testing), see the <a href="/design-system/accessibility">Accessibility</a> chapter.',
      rules: [
        'Blocking overlays use `role="dialog"` and `aria-modal="true"`.',
        'Give every overlay an accessible name.',
        'Manage arrow keys inside menus and listboxes.',
        'Link a tooltip to its trigger with `aria-describedby`.',
        'Respect `prefers-reduced-motion` for the transition.',
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping an overlay.',
      items: [
        {
          title: 'Family',
          body: 'The overlay is one of the five named families, and it is the lightest one that fits the content.',
        },
        {
          title: 'Focus',
          body: 'Focus enters on open, cycles inside, and returns to the trigger on close. The background is inert.',
        },
        {
          title: 'Dismissal',
          body: 'Escape, cancel and outside click all behave as documented. The destructive action is never the default focus.',
        },
        {
          title: 'Stacking',
          body: 'The overlay draws its z-index and shadow from the elevation scale and renders through a portal.',
        },
        {
          title: 'Accessibility',
          body: 'The overlay has a role and a name, menus handle arrow keys, and motion is reduced when requested.',
        },
      ],
    },
  ],
};
