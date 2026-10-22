import type { Topic } from './index';

const componentsContrastBadgeTsx = `export function ContrastBadge({ fg, bg }: { fg: string; bg: string }) {
  const ratio = contrastRatio(fg, bg);
  const pass = ratio >= 4.5;
  return (
    <span
      className={pass ? "text-emerald-700" : "text-rose-700"}
      aria-label={\`Contrast ratio \${ratio.toFixed(2)} to 1, \${pass ? "passes" : "fails"} AA\`}>
      {ratio.toFixed(2)}:1 {pass ? "✓" : "✗"}
    </span>
  );
}`;

const appGlobalsCss = `:focus-visible {
  outline: 2px solid var(--color-cobalt);
  outline-offset: 2px;
}

/* Never this alone:
   button:focus { outline: none; }
   — replace it with a visible :focus-visible style. */`;

const componentsFormFieldTsx = `export function FormField({ label, hint, error, children }: FormFieldProps) {
  const id = useId();
  const messageId = \`\${id}-msg\`;
  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": messageId,
      })}
      <p id={messageId} className={error ? "field-error" : "field-hint"}>
        {error ?? hint}
      </p>
    </div>
  );
}`;

const appGlobalsCss2 = `@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .toggle-pill {
    transition: none;
  }
}`;

export const accessibility: Topic = {
  slug: 'accessibility',
  title: 'Accessibility',
  tagline: 'Target WCAG 2.2 AA, and make the accessible path the default path.',
  summary:
    'Accessibility is a property of the component, not a review that happens at the end. If contrast, focus, keyboard support and semantics are part of the component, everything built from it inherits them.',
  group: 'practice',
  sections: [
    {
      id: 'baseline',
      title: 'The baseline',
      intro: 'Target WCAG 2.2 level AA, and write it into the acceptance criteria.',
      body: 'Accessibility is a hard requirement for a design system, not a nice-to-have. WCAG 2.2 AA is the practical target: it is the standard most public-sector procurement and most European accessibility laws reference.\n\nPut it in the definition of done instead of in a backlog. A component is not "done" until it has a keyboard path, a visible focus ring, correct semantics and passing automated checks. Retrofitting accessibility at the end of a project costs roughly ten times as much as building it in.',
      rules: [
        'WCAG 2.2 AA is the default target for every component.',
        'Accessibility acceptance criteria live in the component definition of done.',
        'Nothing ships with a known critical or serious violation.',
      ],
    },
    {
      id: 'contrast',
      title: 'Contrast',
      intro: 'The check that catches the most problems and the one teams skip most.',
      body: 'Text needs a contrast ratio of at least **4.5:1** against its background, or **3:1** for large text (18.66px bold or 24px regular and above). Non-text UI components — input borders, focus rings, icons that carry meaning, chart marks — need **3:1** against what is adjacent to them.\n\nThe trap is that contrast depends on the *actual* background, not the token name. A `color-text-muted` token that passes on `--color-surface` may fail on `--color-surface-raised`, and it will definitely fail in dark mode. Check every token pairing, in every theme, and automate it.',
      examples: [
        'Body text: 4.5:1 minimum',
        'Large text (≥ 24px, or ≥ 18.66px bold): 3:1 minimum',
        'Icons, borders, focus rings, chart marks: 3:1 minimum',
        'Never rely on colour alone to convey state — pair it with an icon, text or shape',
      ],
      rules: [
        'Check contrast against the real background, in every theme.',
        'Automated contrast tests in CI, not a manual pass once.',
        'Placeholder and disabled text still need to be readable — exempt only when the value is incidental.',
        'Do not communicate status with colour alone.',
      ],
      code: {
        label: 'components/ContrastBadge.tsx',
        source: componentsContrastBadgeTsx,
      },
    },
    {
      id: 'keyboard',
      title: 'Keyboard support',
      intro: 'If it cannot be reached with Tab, it does not exist.',
      body: 'Every interactive element must be reachable with Tab, operable with Enter or Space, and — for composite widgets — navigable with the arrow keys. Focus must always be visible, and it must never get trapped in a region that cannot be escaped.\n\nDo not build this from scratch. Menus, dialogs, tabs, comboboxes and date pickers have focus management, roving tabindex and `aria-activedescendant` logic that is genuinely hard to get right. Use a headless primitive (Radix, React Aria, or the native element) and style it instead.',
      items: [
        {
          title: 'Reachable',
          body: 'Every actionable element is in the tab order, in an order that matches the visual order.',
        },
        {
          title: 'Operable',
          body: 'Enter and Space activate; Escape closes; arrow keys move within a composite widget.',
        },
        {
          title: 'Visible',
          body: 'A focus indicator that at least meets 3:1 against the adjacent background, never removed without a replacement.',
        },
        {
          title: 'Not trapped',
          body: 'Dialogs trap focus while open and return it to the trigger on close.',
        },
      ],
      rules: [
        'Never remove `outline` without providing a `:focus-visible` replacement.',
        'Do not use a positive `tabindex`; it breaks the natural order.',
        'Use `aria-hidden` on icons that duplicate adjacent text.',
        'Provide a skip link to the main content.',
      ],
      code: {
        label: 'app/globals.css',
        source: appGlobalsCss,
      },
    },
    {
      id: 'semantics',
      title: 'Semantics and ARIA',
      intro: 'The first rule of ARIA is not to use ARIA.',
      body: 'Native HTML brings keyboard behaviour, focus behaviour and screen reader semantics for free. A `<button>` is focusable, activates on Enter and Space, and announces itself as a button. A `<div onClick={...}>` is none of those things, and adding `role="button"` and `tabIndex={0}` gets you maybe half of them back.\n\nUse the right element first: `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`, `<header>`, `<table>` with real `<th scope>`, `<label htmlFor>` tied to its input. Reach for ARIA only to fill a gap that HTML cannot express.',
      rules: [
        'Native element first, ARIA second, and never a `<div>` with a click handler.',
        'Every form control has a `<label>` tied with `htmlFor`.',
        'Use `aria-describedby` for hints and errors, and `aria-invalid` for the error state.',
        'One `h1` per page, and headings that descend without skipping a level.',
        'Set `lang` on `<html>` and `alt` on every image, empty for decorative ones.',
      ],
      code: {
        label: 'components/FormField.tsx',
        source: componentsFormFieldTsx,
      },
    },
    {
      id: 'motion',
      title: 'Motion',
      intro: 'Motion should be an enhancement you can switch off.',
      body: 'Animation helps people understand where something came from and where it went. It also makes some people ill. `prefers-reduced-motion: reduce` is a request from the operating system, and it must be honoured — turn transitions and parallax off rather than merely shortening them.\n\nKeep durations short. A UI transition that takes longer than about 300ms starts to feel like lag, and a page transition longer than that blocks the next action.',
      code: {
        label: 'app/globals.css',
        source: appGlobalsCss2,
      },
      rules: [
        'Honour `prefers-reduced-motion` for every animation, including transitions.',
        'Never flash more than three times per second.',
        'Keep UI transitions under 300ms.',
        'Do not autoplay looping motion.',
      ],
    },
    {
      id: 'testing',
      title: 'Testing',
      intro: 'Three kinds of test, and only one of them catches most problems.',
      body: '**Automated** checks (axe in CI, eslint-plugin-jsx-a11y) catch the mechanical failures — a missing label, a bad contrast pair, an invalid `aria-*` value. They are cheap and they run on every commit, but they catch perhaps a third of real problems.\n\n**Keyboard** testing catches the rest: focus that disappears, traps, wrong order, invisible rings. Do it by hand on every component, once, at least.\n\n**Screen reader** testing catches what neither of the others sees: a control that announces as "button" with no name, a live region that never announces, a table with no headers. Use VoiceOver on macOS and iOS, NVDA on Windows, and TalkBack on Android.',
      items: [
        {
          title: 'Automated, on every commit',
          body: 'axe-core in unit and end-to-end tests; a11y lint on every component. Fail the build.',
        },
        {
          title: 'Keyboard, by hand',
          body: 'Tab through the whole component, then activate everything with Enter and Space. Every time.',
        },
        {
          title: 'Screen reader, by hand',
          body: 'Listen to one full pass of the component. Note anything you cannot follow.',
        },
        {
          title: 'Users, eventually',
          body: 'Usability testing with people who rely on assistive technology finds the problems no checklist lists.',
        },
      ],
      rules: [
        'Run axe in CI and fail the build on violations.',
        'Test every component with the keyboard before it ships.',
        'Do not ship a component with an unnamed interactive element.',
        'Fix the source, not the test. A skipped axe rule is a bug, not a configuration.',
      ],
    },
  ],
};
