import type { Topic } from '../index';
import { lifecycle, versioning, contribution } from './svg-generated';

const changelogMd = `## 2.0.0

### Breaking

- Remove \`--color-surface\`. Use \`--color-paper\` for the page and
  \`--color-rule\` for borders. A codemod ships in this release.
- \`Button\` no longer accepts \`variant="link"\`. Use \`LinkButton\`.

### Added

- \`Overlays\` chapter: modal, drawer, popover, menu and tooltip.
- Token \`--shadow-xl\` for transient surfaces.

### Fixed

- Focus is restored to the trigger when a modal closes.

## 1.5.1

### Fixed

- Correct contrast of \`--color-mute\` on \`--color-rule\`.`;

const deprecationCss = `/* 1.x: warn, do not break. */
.button--primary {
  background: var(--color-cobalt);
}

/* Deprecated in 1.8 — still works until 2.0. */
.button--brand {
  background: var(--color-cobalt);
}

/* 2.0: the old name is gone; the codemod rewrites it. */
.button--primary {
  background: var(--color-cobalt);
}`;

const contributionMd = `# Proposing a change

1. **Check first.** Search the system for an existing token or component
   that already does the job.
2. **File a proposal.** Say what the product needs, not what the API should
   be. Link the screens that need it.
3. **Get a decision.** The system team replies within a sprint: token,
   component, or guidance.
4. **Build in the open.** Prototype in the requesting product, then move the
   finished work into the system with a spec and tests.
5. **Ship and announce.** Release under semver, document the change, and add
   it to the changelog.`;

export const governance: Topic = {
  slug: 'governance',
  title: 'Governance',
  tagline: 'How a design system ships, evolves and stays adopted.',
  summary:
    'A design system is a product, with its own users, roadmap and releases. Governance is how changes get proposed, reviewed, versioned and adopted, so the system grows without breaking the teams that depend on it. Without governance a design system becomes a library nobody trusts and quietly forks around.',
  group: 'practice',
  sections: [
    {
      id: 'philosophy',
      title: 'Governance philosophy',
      intro: 'Treat the system as a product, not a project.',
      body: 'A design system that ships once and then freezes is a project; one that keeps its users on a supported version is a product. That means owning a roadmap, a release cadence and a support channel, and it means saying no: not every pattern belongs in the system, and not every request should be honoured. The teams that adopt the system are its customers, and their pull requests and complaints are the roadmap. Governance makes those decisions predictable, so a change is never a surprise and never a private fork.',
      rules: [
        'Treat the system as a product with named owners.',
        'Publish a roadmap and a release cadence.',
        'Say no deliberately; a system that accepts everything stands for nothing.',
        'Keep one canonical source. A fork is a bug in governance.',
        'Measure adoption, not just component count.',
      ],
      visuals: [
        {
          title: 'The life of a change',
          caption: 'From proposal to adoption: a product decision, not a pull request alone.',
          svg: lifecycle,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'documentation',
      title: 'Documentation',
      intro: 'A component without docs is an undocumented API.',
      body: 'Documentation is the interface between the system and the people using it, and it ships with the code. Every component needs a live example, the props and tokens it accepts, and the do and do-not cases that stop the next team from repeating a mistake. This site is itself an example of the shape: prose, examples, rules and a worked code sample per chapter. Documentation that lags behind the implementation is worse than none, because it teaches the wrong thing confidently.',
      rules: [
        'Ship docs with the code, in the same pull request.',
        'Every component has a live, copyable example.',
        'Record the do and do-not cases, not just the happy path.',
        'Document the why: the decision behind a rule outlives the rule.',
        'Treat a docs gap as a defect with an owner.',
      ],
      code: {
        label: 'CHANGELOG.md',
        source: changelogMd,
      },
    },
    {
      id: 'versioning',
      title: 'Versioning and releases',
      intro: 'Semantic versioning is a promise to consumers.',
      body: 'Semver is only useful if the system keeps its promise. A breaking change to a token or a component is a major release, an additive change is a minor, and a fix that no consumer can observe is a patch. Breaking changes are not banned, but they must be earned: deprecate first, warn in the console where you can, ship a codemod, and only then remove the old name in the next major. A fixed release cadence beats a big-bang rewrite, because teams can plan an upgrade.',
      rules: [
        'Removing or renaming a token or prop is a major release.',
        'Adding a component or a token is a minor release.',
        'Deprecate before you remove, and ship a codemod.',
        'Keep a human changelog, not just commit messages.',
        'Release on a cadence; do not save everything for a rewrite.',
      ],
      code: {
        label: 'deprecation.css',
        source: deprecationCss,
      },
      visuals: [
        {
          title: 'Semantic versioning',
          caption: 'Major, minor and patch: what each one commits the system to.',
          svg: versioning,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'contribution',
      title: 'Contribution',
      intro: 'A clear path in beats a thousand forks.',
      body: 'Most new components start in a product, not in the system, and that is healthy; the job of governance is to make the path from a product pattern to a shipped system component obvious. Write the criteria down: what a pattern must prove before it is promoted, who decides, and how long a decision takes. When the answer is always "the system team will build it", the queue grows and teams route around it. When the criteria are public, anyone can contribute and the system team reviews rather than gatekeeps.',
      rules: [
        'Publish the criteria for promoting a pattern into the system.',
        'Let product teams contribute the implementation, not just the request.',
        'Give a decision or a redirect within a fixed time.',
        'Review against the criteria, not against taste.',
        'Credit contributors; adoption follows ownership.',
      ],
      code: {
        label: 'CONTRIBUTING.md',
        source: contributionMd,
      },
      visuals: [
        {
          title: 'Contribution flow',
          caption: 'From a product request to a component shipped for everyone.',
          svg: contribution,
          full: true,
          minWidth: 520,
          maxWidth: 680,
        },
      ],
    },
    {
      id: 'adoption',
      title: 'Adoption',
      intro: 'A system nobody uses has failed, however good it is.',
      body: 'Adoption is not a launch; it is the slow work of getting teams onto the current version and keeping them there. Measure it: how many products import the system, how many are on a supported version, how many have forked a component. Make upgrading cheap with codemods and clear changelogs, and make staying current the path of least resistance. A component that half the products have copied is a signal, not a success.',
      rules: [
        'Track which products use the system and at which version.',
        'Make upgrading cheap; a codemod is a feature.',
        'Watch for forks and copies — they mark where the system failed.',
        'Deprecate loudly and migrate teams, do not just announce.',
        'Report adoption alongside the release notes.',
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before a system can be called governed.',
      items: [
        {
          title: 'Ownership',
          body: 'The system has named owners, a roadmap and a release cadence.',
        },
        {
          title: 'Documentation',
          body: 'Docs ship with the code, with live examples and do and do-not guidance.',
        },
        {
          title: 'Versioning',
          body: 'Semver is enforced. Breaking changes are deprecated first and ship with a codemod.',
        },
        {
          title: 'Contribution',
          body: 'The path from a product pattern to a system component is public and time-boxed.',
        },
        {
          title: 'Adoption',
          body: 'Adoption and version lag are measured, and forks are investigated rather than ignored.',
        },
      ],
    },
  ],
};
