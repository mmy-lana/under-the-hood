/**
 * App-wide shared types (non-content). Content types live in
 * `src/lib/content/schema.ts`; anything UI/state related lives here.
 */

export type DepthTier = 'eli5' | 'junior' | 'senior' | 'underTheHood';

export type ThemeName = 'paper' | 'obsidian' | 'studio';

/** Flattened, search-optimized record derived from TopicSchema at build time. */
export interface SearchRecord {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  tags: string[];
  frameworks: string[];
  href: string;
}

/** Pre-highlighted HTML payload produced by the Shiki build-time pipeline. */
export interface HighlightedCode {
  html: string;
  code: string;
}