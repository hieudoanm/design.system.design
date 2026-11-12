/*
 * The thirty Laws of UX as data: one entry per principle, grouped for the
 * chapter page and detailed on its own route. Definitions follow
 * lawsofux.com (Jon Yablonski); `takeaway` is the design-system application.
 */

export type LawGroupId = 'perception' | 'memory' | 'choice' | 'effort' | 'experience';

export interface UxLaw {
  slug: string;
  name: string;
  group: LawGroupId;
  /** The canonical one-line statement of the principle. */
  definition: string;
  /** Where the principle shows up in a token, component or pattern decision. */
  takeaway: string;
  /** The original entry on lawsofux.com. */
  source: string;
}

export const lawGroups: { id: LawGroupId; title: string; intro: string }[] = [
  {
    id: 'perception',
    title: 'Perception and grouping',
    intro:
      'The Gestalt laws describe how the eye binds separate marks into objects and groups before the brain starts reading. Most of them are already encoded in spacing and border tokens — the trick is choosing them on purpose.',
  },
  {
    id: 'memory',
    title: 'Memory and cognitive load',
    intro:
      'Working memory is small and temporary. Every interface either respects that budget or spends it on the user’s behalf — which is what good defaults and progressive disclosure are for.',
  },
  {
    id: 'choice',
    title: 'Choice and decisions',
    intro:
      'Every option on screen is a small tax on decision time. These laws describe how that tax compounds — and how to keep the number of decisions a user makes per screen low.',
  },
  {
    id: 'effort',
    title: 'Speed and effort',
    intro:
      'Perceived performance is a design material. These laws govern how fast an interface must feel and how much work it should ask of the user.',
  },
  {
    id: 'experience',
    title: 'Experience and trust',
    intro:
      'Judgement of an interface is emotional before it is analytical. These laws explain why polish and familiarity carry real weight.',
  },
];

export const lawGroupTitle = (id: LawGroupId): string =>
  lawGroups.find((group) => group.id === id)?.title ?? id;

export const uxLaws: UxLaw[] = [
  // Perception and grouping
  {
    slug: 'law-of-proximity',
    name: 'Law of Proximity',
    group: 'perception',
    definition: 'Objects that are near, or proximate to each other, tend to be grouped together.',
    takeaway:
      'In a token set this is why `space-2` inside a component and `space-8` between sections are different decisions, not one spacing scale applied everywhere. Tighter gaps bind labels to inputs; larger gaps separate unrelated blocks.',
    source: 'https://lawsofux.com/law-of-proximity/',
  },
  {
    slug: 'law-of-similarity',
    name: 'Law of Similarity',
    group: 'perception',
    definition:
      'The human eye tends to perceive similar elements as a complete picture, shape, or group, even if those elements are separated.',
    takeaway:
      'Reusing one button shape for every action — and a different one for links — lets users classify controls without reading them. Similarity is a contract: break it and the interface starts lying.',
    source: 'https://lawsofux.com/law-of-similarity/',
  },
  {
    slug: 'law-of-common-region',
    name: 'Law of Common Region',
    group: 'perception',
    definition:
      'Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary.',
    takeaway:
      'Cards, fieldsets and bordered panels are the common-region primitive; a `border` token with a radius is often all the grouping a layout needs.',
    source: 'https://lawsofux.com/law-of-common-region/',
  },
  {
    slug: 'law-of-uniform-connectedness',
    name: 'Law of Uniform Connectedness',
    group: 'perception',
    definition:
      'Elements that are visually connected are perceived as more related than elements with no connection.',
    takeaway:
      'A connector in a diagram or a divider in a list is a grouping signal, not decoration. Lines and shared containers tell the eye what belongs together before any label does.',
    source: 'https://lawsofux.com/law-of-uniform-connectedness/',
  },
  {
    slug: 'law-of-pragnanz',
    name: 'Law of Prägnanz',
    group: 'perception',
    definition:
      'People will perceive and interpret ambiguous or complex images as the simplest form possible, because it is the interpretation that requires the least cognitive effort.',
    takeaway:
      'A chart with four marks reads faster than one with forty — simplify the mark before adding a legend. When a visual can be read two ways, users will pick the simpler one, right or wrong.',
    source: 'https://lawsofux.com/law-of-pr%C3%A4gnanz/',
  },
  {
    slug: 'selective-attention',
    name: 'Selective Attention',
    group: 'perception',
    definition:
      'The process of focusing our attention only to a subset of stimuli in an environment — usually those related to our goals.',
    takeaway:
      'Users focus on what they came for and filter the rest. Visual noise is not neutral: every badge, border and animation competes with the thing the user came for.',
    source: 'https://lawsofux.com/selective-attention/',
  },
  {
    slug: 'von-restorff-effect',
    name: 'Von Restorff Effect',
    group: 'perception',
    definition:
      'When multiple similar objects are present, the one that differs from the rest is most likely to be remembered.',
    takeaway:
      'One accent colour on a screen of neutrals is a feature; accent colours everywhere cancel each other out. Differentiate deliberately — the exception is what gets seen.',
    source: 'https://lawsofux.com/von-restorff-effect/',
  },

  // Memory and cognitive load
  {
    slug: 'working-memory',
    name: 'Working Memory',
    group: 'memory',
    definition:
      'A cognitive system that temporarily holds and manipulates information needed to complete tasks.',
    takeaway:
      'Anything the interface can remember for the user — form state, scroll position, recent searches — frees working memory for the task itself.',
    source: 'https://lawsofux.com/working-memory/',
  },
  {
    slug: 'millers-law',
    name: "Miller's Law",
    group: 'memory',
    definition:
      'The average person can only keep 7 (plus or minus 2) items in their working memory.',
    takeaway:
      'Chunk long lists into groups of three to five — navigation menus, table columns, onboarding steps — and keep the chunks meaningful. The number matters less than the grouping.',
    source: 'https://lawsofux.com/millers-law/',
  },
  {
    slug: 'cognitive-load',
    name: 'Cognitive Load',
    group: 'memory',
    definition:
      'The amount of mental resources needed to understand and interact with an interface.',
    takeaway:
      'Load comes from ambiguity, not length: unclear labels and inconsistent patterns cost more than a long but predictable page. Every decision the interface makes for the user is load removed.',
    source: 'https://lawsofux.com/cognitive-load/',
  },
  {
    slug: 'chunking',
    name: 'Chunking',
    group: 'memory',
    definition:
      'A process by which individual pieces of an information set are broken down and then grouped together in a meaningful whole.',
    takeaway:
      'Phone numbers, card numbers and dates are chunked because raw strings are unmemorable; apply the same grouping to IDs, codes and dense tables.',
    source: 'https://lawsofux.com/chunking/',
  },
  {
    slug: 'cognitive-bias',
    name: 'Cognitive Bias',
    group: 'memory',
    definition:
      'A systematic error of thinking or rationality in judgment that influence our perception of the world and our decision-making ability.',
    takeaway:
      'Defaults, anchors and framing are biases you can design with deliberately — or accidentally. A pre-selected plan or a "most popular" badge is a bias doing work; know which side you are on.',
    source: 'https://lawsofux.com/cognitive-bias/',
  },
  {
    slug: 'mental-model',
    name: 'Mental Model',
    group: 'memory',
    definition:
      'A compressed model based on what we think we know about a system and how it works.',
    takeaway:
      'Interfaces that match the model — a trash icon deletes, a gear opens settings — need no manual; mismatches produce support tickets. Novel interactions earn their learning cost only when the payoff is large.',
    source: 'https://lawsofux.com/mental-model/',
  },
  {
    slug: 'serial-position-effect',
    name: 'Serial Position Effect',
    group: 'memory',
    definition: 'Users have a propensity to best remember the first and last items in a series.',
    takeaway:
      'Put the most important navigation, options and actions at the ends of a list, not the middle. The middle of a long menu is where items go to be forgotten.',
    source: 'https://lawsofux.com/serial-position-effect/',
  },
  {
    slug: 'zeigarnik-effect',
    name: 'Zeigarnik Effect',
    group: 'memory',
    definition: 'People remember uncompleted or interrupted tasks better than completed tasks.',
    takeaway:
      'Progress indicators and “you’re almost done” states use this deliberately — an unfinished checklist keeps the user coming back. Completion states should feel earned, not just reached.',
    source: 'https://lawsofux.com/zeigarnik-effect/',
  },

  // Choice and decisions
  {
    slug: 'hicks-law',
    name: "Hick's Law",
    group: 'choice',
    definition:
      'The time it takes to make a decision increases with the number and complexity of choices.',
    takeaway:
      'Minimize options where speed matters, break complex tasks into steps, and highlight the recommended choice instead of presenting everything equally.',
    source: 'https://lawsofux.com/hicks-law/',
  },
  {
    slug: 'choice-overload',
    name: 'Choice Overload',
    group: 'choice',
    definition:
      'The tendency for people to get overwhelmed when they are presented with a large number of options, often used interchangeably with the term paradox of choice.',
    takeaway:
      'A filter or a curated default beats a wall of forty equivalent cards. When every option looks equal, users pick none — or pick badly and blame the product.',
    source: 'https://lawsofux.com/choice-overload/',
  },
  {
    slug: 'pareto-principle',
    name: 'Pareto Principle',
    group: 'choice',
    definition:
      'The Pareto principle states that, for many events, roughly 80% of the effects come from 20% of the causes.',
    takeaway:
      'Design the 20% of features and content that carry 80% of usage first; the long tail can wait for progressive disclosure. Analytics, not opinion, decides which 20%.',
    source: 'https://lawsofux.com/pareto-principle/',
  },
  {
    slug: 'goal-gradient-effect',
    name: 'Goal-Gradient Effect',
    group: 'choice',
    definition: 'The tendency to approach a goal increases with proximity to the goal.',
    takeaway:
      'Progress bars that start partway filled, or steps that feel almost done, pull users through a flow faster than an empty bar. Show the distance to done, and shrink it visibly.',
    source: 'https://lawsofux.com/goal-gradient-effect/',
  },

  // Speed and effort
  {
    slug: 'doherty-threshold',
    name: 'Doherty Threshold',
    group: 'effort',
    definition:
      'Productivity soars when a computer and its users interact at a pace (<400ms) that ensures that neither has to wait on the other.',
    takeaway:
      'Skeleton states and optimistic UI exist to hold that threshold when the real work takes longer. Perceived speed is a feature you ship, not a metric you measure afterwards.',
    source: 'https://lawsofux.com/doherty-threshold/',
  },
  {
    slug: 'fitts-law',
    name: "Fitts's Law",
    group: 'effort',
    definition:
      'The time to acquire a target is a function of the distance to and size of the target.',
    takeaway:
      'Bigger, closer targets are faster to hit: primary actions get large hit areas, destructive actions get distance and confirmation. A 16px icon in a corner is a targeting exercise.',
    source: 'https://lawsofux.com/fittss-law/',
  },
  {
    slug: 'occams-razor',
    name: "Occam's Razor",
    group: 'effort',
    definition:
      'Among competing hypotheses that predict equally well, the one with the fewest assumptions should be selected.',
    takeaway:
      'The same applies to UI: the simplest interface that satisfies the requirement is the one to ship. Every element that can be removed without losing function is complexity refunded.',
    source: 'https://lawsofux.com/occams-razor/',
  },
  {
    slug: 'teslers-law',
    name: "Tesler's Law",
    group: 'effort',
    definition:
      "Tesler's Law, also known as The Law of Conservation of Complexity, states that for any system there is a certain amount of complexity which cannot be reduced.",
    takeaway:
      'Good design moves complexity into the software (sensible defaults, smart validation) rather than onto the user. If the user must understand your data model to finish a task, the complexity landed in the wrong place.',
    source: 'https://lawsofux.com/teslers-law/',
  },
  {
    slug: 'parkinsons-law',
    name: "Parkinson's Law",
    group: 'effort',
    definition: 'Any task will inflate until all of the available time is spent.',
    takeaway:
      'A three-step flow will take three steps’ worth of effort; a ten-step wizard invites ten steps of hesitation. Fewer steps is not just faster — it feels faster.',
    source: 'https://lawsofux.com/parkinsons-law/',
  },
  {
    slug: 'postels-law',
    name: "Postel's Law",
    group: 'effort',
    definition: 'Be liberal in what you accept, and conservative in what you send.',
    takeaway:
      'Forms that tolerate input variations — case, spacing, format — and outputs that are strict and predictable are both applications. Forgiving input, disciplined output.',
    source: 'https://lawsofux.com/postels-law/',
  },
  {
    slug: 'paradox-of-the-active-user',
    name: 'Paradox of the Active User',
    group: 'effort',
    definition: 'Users never read manuals but start using the software immediately.',
    takeaway:
      'That makes discoverability, sensible defaults and forgiveness more important than documentation. Design for the user who never reads the tooltip.',
    source: 'https://lawsofux.com/paradox-of-the-active-user/',
  },

  // Experience and trust
  {
    slug: 'jakobs-law',
    name: "Jakob's Law",
    group: 'experience',
    definition:
      'Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know.',
    takeaway:
      'Familiar patterns — a cart icon top-right, a modal that closes on Escape — cost nothing and buy trust. Innovation belongs in the product, not in the navigation.',
    source: 'https://lawsofux.com/jakobs-law/',
  },
  {
    slug: 'aesthetic-usability-effect',
    name: 'Aesthetic-Usability Effect',
    group: 'experience',
    definition: 'Users often perceive aesthetically pleasing design as design that’s more usable.',
    takeaway:
      'Visual polish does not fix a broken flow, but it buys patience while the flow is learned. Invest in beauty after the mechanics work — not instead of them.',
    source: 'https://lawsofux.com/aesthetic-usability-effect/',
  },
  {
    slug: 'peak-end-rule',
    name: 'Peak-End Rule',
    group: 'experience',
    definition:
      'People judge an experience largely based on how they felt at its peak and at its end, rather than the total sum or average of every moment of the experience.',
    takeaway:
      'Invest in the confirmation screen and the empty state — the moments users actually remember. A flawless middle cannot rescue a bad ending.',
    source: 'https://lawsofux.com/peak-end-rule/',
  },
  {
    slug: 'flow',
    name: 'Flow',
    group: 'experience',
    definition:
      'The mental state in which a person performing some activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity.',
    takeaway:
      'Interfaces that are too easy bore, too hard frustrate; clear feedback and progressive difficulty keep users in the channel. The best interface is the one you stop noticing.',
    source: 'https://lawsofux.com/flow/',
  },
];

export const getLaw = (slug: string): UxLaw | undefined => uxLaws.find((law) => law.slug === slug);

export const lawsByGroup = (group: LawGroupId): UxLaw[] =>
  uxLaws.filter((law) => law.group === group);
