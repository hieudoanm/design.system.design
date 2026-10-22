import type { Topic } from '../index';

export const feedback: Topic = {
  slug: 'feedback',
  title: 'Feedback',
  tagline: 'Toasts, alerts and banners.',
  summary:
    'Feedback components communicate state changes and results to users. They are assertive enough to get attention but unobtrusive enough not to block interaction unnecessarily. Good feedback is timely, clear and dismissible.',
  group: 'data-charts',
  sections: [
    {
      id: 'philosophy',
      title: 'Feedback philosophy',
      intro: 'Feedback should be timely, clear and dismissible.',
      body: 'Feedback components communicate state changes and results to users. They are assertive enough to get attention but unobtrusive enough not to block interaction unnecessarily. A toast auto-dismisss after a timeout. An alert or banner remains until the user dismisses it. A modal or drawer blocks until addressed. The duration and mode of dismissal should be clear from the design and the microcopy.',
      rules: [
        'Toasts auto-dismiss after a set timeout.',
        'Alerts and banners remain until dismissed by the user.',
        'Modals and drawers block interaction until addressed.',
        'Microcopy is clear and actionable. Status is perceivable without relying on color alone.',
        'Respect prefers-reduced-motion for auto-dismissing toast.',
      ],
      visuals: [
        {
          title: 'Feedback component types',
          caption: 'Toasts alerts banners and modals',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Feedback</text><rect x="60" y="70" width="120" height="60" rx="8" fill="var(--color-action-bg)"/><text x="120" y="95" font-size="9" fill="var(--color-ink)">toast</text><text x="60" y="160" font-size="9" fill="var(--color-mute)">auto-dismiss</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'atoms',
      title: 'Atoms',
      intro: 'The smallest feedback building blocks.',
      body: 'Feedback atoms are the fundamental UI primitives: button, icon, close icon, progress bar, spinner. Each atom ships with every state default hover focus active disabled and styles from design tokens.',
      examples: ['Close icon button', 'Progress bar segment', 'Spinner component'],
      rules: [
        'Style only from design tokens.',
        'Provide visible focus indicators.',
        'Cover all states default hover focus active disabled.',
        'Prefer headless primitives for behaviour.',
      ],
      visuals: [
        {
          title: 'Feedback atom examples',
          caption: 'Basic building blocks: buttons icons spinners',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Atoms</text><rect x="60" y="70" width="120" height="60" rx="8" fill="var(--color-action-bg)"/><text x="120" y="95" font-size="9" fill="var(--color-ink)">spinner</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'molecules',
      title: 'Molecules',
      intro: 'Groups of atoms that form feedback patterns.',
      body: 'Feedback molecules combine atoms into purposeful patterns. A button and icon become a toast trigger. An icon and text become an alert. A progress bar and text become a status update. The test: if you can describe its purpose in one short sentence it is probably a molecule.',
      examples: [
        'Toast trigger (button + icon)',
        'Alert (icon + message + action)',
        'Status bar (progress + text)',
      ],
      rules: [
        'Compose atoms. Do not restyle them from the inside.',
        'Own the layout between the atoms spacing and alignment.',
        'Use appropriate ARIA roles and labels.',
      ],
      visuals: [
        {
          title: 'Feedback molecule examples',
          caption: 'Groups of atoms that form useful feedback patterns',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Molecules</text><rect x="60" y="70" width="160" height="50" rx="8" fill="var(--color-action-bg)"/><text x="140" y="95" font-size="9" fill="var(--color-ink)">toast trigger</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'organisms',
      title: 'Organisms',
      intro: 'Larger feedback regions made of molecules.',
      body: 'Feedback organisms are distinct interface regions: a toast container an alert banner a modal drawer. They can hold state open closed loading and accept data through props but their visual building blocks all come from lower levels.',
      examples: [
        'Toast container (multiple toasts stacking)',
        'Alert banner (persistent at top of page)',
        'Modal drawer (forms confirmation)',
      ],
      rules: [
        'Accept data through props. Do not fetch inside the component.',
        'Handle open loading and error states explicitly.',
        'Make them accessible with focus management.',
      ],
      visuals: [
        {
          title: 'Feedback organism examples',
          caption: 'Distinct regions of feedback built from lower-level components',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Organisms</text><rect x="60" y="70" width="200" height="60" rx="8" fill="var(--color-surface)" stroke="var(--color-rule)" stroke-width="1"/><text x="160" y="95" font-size="9" fill="var(--color-ink)">toast container</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      intro: 'Feedback must work for everyone.',
      body: 'Feedback components must be operable via keyboard and screen reader friendly. Toasts should announce their message to screen readers. Alerts and banners should have dismiss buttons with clear labels. Modals and drawers should trap focus and provide escape key handling.',
      rules: [
        'Toasts announce their message to screen readers via ARIA live regions.',
        'Alerts and banners have dismiss buttons with clear label text.',
        'Modals and drawers trap focus and provide escape key handling.',
        'Never use color alone to convey status.',
        'Respect prefers-reduced-motion.',
      ],
      visuals: [
        {
          title: 'Accessible feedback patterns',
          caption: ' ARIA live regions and dismiss patterns',
          svg: '<svg viewBox="0 0 640 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg"><text x="24" y="30" font-size="12" font-weight="600" fill="var(--color-ink)">Accessibility</text><text x="60" y="70" font-size="9" fill="var(--color-mute)">ARIA live</text><rect x="60" y="90" width="100" height="40" rx="8" fill="var(--color-action-bg)"/><text x="120" y="115" font-size="9" fill="var(--color-ink)">role="alert"</text></svg>',
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'practical',
      title: 'Practical guidelines',
      intro: 'Tips for applying feedback patterns consistently.',
      body: 'Start with the most common pattern toast for transient messages. Add alerts for important but non-blocking information. Use modals or drawers only for critical interactions that require user attention. Always test with keyboard and screen reader.',
      rules: [
        'Start with toast for transient messages.',
        'Add alerts for important but non-blocking information.',
        'Use modals or drawers only for critical interactions.',
        'Always test with keyboard and screen reader.',
        'Respect prefers-reduced-motion.',
      ],
      items: [
        {
          title: 'Do',
          body: 'Use clear microcopy. Set appropriate timeouts. Provide dismiss buttons.',
        },
        {
          title: "Don't",
          body: 'Do not block the main thread with long-running init. Do not skip screen reader announcement.',
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping your feedback system.',
      items: [
        {
          title: 'Timing',
          body: 'Toasts auto-dismiss after appropriate timeout. Alerts and banners remain until dismissed.',
        },
        {
          title: 'Accessibility',
          body: 'ARIA live regions for toasts alerts. Focus management for modals drawers. Color is not the only means of conveying status.',
        },
        {
          title: 'Clarity',
          body: 'Microcopy is clear and actionable. Status is perceivable without relying on color alone.',
        },
      ],
    },
  ],
};
