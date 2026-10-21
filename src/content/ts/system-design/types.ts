export type QA = { q: string; a: string };

/** A titled chunk of explanation. Body supports `code`, **bold** and blank-line paragraphs. */
export type Block = { title: string; body: string };

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Problem = {
  slug: string;
  title: string;
  tagline: string;
  difficulty: Difficulty;
  tags: string[];
  functional: string[];
  nonFunctional: string[];
  /** Back-of-the-envelope numbers. */
  estimation: string[];
  /** ASCII architecture diagram. Avoid backslashes. */
  diagram: string;
  design: Block[];
  qa: QA[];
};
