/**
 * Content model — mirrors SPEC §3 exactly. Single source of truth for every
 * topic JSON file under `content/**`. No ad-hoc types anywhere else.
 */

export type TopicCategory = 'frontend' | 'backend';
export type RosettaFramework = string;
export interface ProgressiveDepth {
  /** Real-world physical metaphor, ZERO jargon (no "DOM", "function", "memory"). */
  eli5: string;
  /** Practical API level: how to use, modern syntax vs legacy. */
  junior: string;
  /** Architectural impact: re-render boundaries, lifecycle, garbage collection. */
  senior: string;
  /** Low-level mechanics: DOM ops, AST transformations, memory/microtasks. */
  underTheHood: string;
}

export interface FullFile {
  filename: string;
  language: string;
  code: string;
}

export interface DiffSide {
  label: string;
  snippet: string;
  fullFile: FullFile;
}

export interface CodeComparison {
  title: string;
  summary: string;
  legacyOrBad: DiffSide;
  modernOrGood: DiffSide;
}

export interface InterviewGotcha {
  question: string;
  /** The setup: why interviewers ask this and the real-world scenario. */
  contextIntro: string;
  /** The deep mechanical answer explaining why it behaves that way. */
  detailedAnswer: string;
  /** The common naive mistake candidates make. */
  trapWarning: string;
}

export interface TopicSchema {
  id: string;
  title: string;
  category: TopicCategory;
  subcategory: string;
  /** e.g. 'Angular 17+', 'React 19+'. */
  versionContext?: string;
  /** YYYY-MM-DD */
  lastUpdated: string;
  tags: string[];
  prerequisites: string[];
  progressiveExplaining: ProgressiveDepth;
  /** Framework equivalents keyed by `react|angular|vue|svelte`. */
  rosettaStone?: Record<string, string>;
  codeComparison: CodeComparison;
  /** EXACTLY TWO gotchas required. */
  interviewGotchas: [InterviewGotcha, InterviewGotcha];
}