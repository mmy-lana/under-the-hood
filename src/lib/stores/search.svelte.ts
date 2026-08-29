import Fuse from 'fuse.js';
import type { FuseResultMatch, IFuseOptions, RangeTuple } from 'fuse.js';
import type { SearchRecord } from '$lib/types';

/**
 * Client-side fuzzy search. The Fuse instance is created lazily on first
 * open of the palette (30 records — trivial cost) and cached thereafter.
 */

let fuse: Fuse<SearchRecord> | null = null;

const FUSE_OPTIONS: IFuseOptions<SearchRecord> = {
  includeMatches: true,
  ignoreLocation: true,
  threshold: 0.4,
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'tags', weight: 0.2 },
    { name: 'subcategory', weight: 0.1 },
    { name: 'category', weight: 0.1 }
  ]
};

export interface SearchHit {
  item: SearchRecord;
  /** Matched substring ranges per key, for <mark> highlighting. */
  matches: ReadonlyArray<Pick<FuseResultMatch, 'key' | 'indices'>>;
}

export type MatchRange = RangeTuple;

export function search(query: string, index: SearchRecord[]): SearchHit[] {
  if (!fuse) {
    fuse = new Fuse<SearchRecord>(index, FUSE_OPTIONS);
  }
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];
  const results = fuse.search(trimmed);
  return results.map((r) => ({ item: r.item, matches: r.matches ?? [] }));
}

/** Find the first matching range for a given key, or empty array. */
export function matchRangesFor(hit: SearchHit, key: string): ReadonlyArray<RangeTuple> {
  const match = hit.matches.find((m) => m.key === key);
  return match ? match.indices : [];
}