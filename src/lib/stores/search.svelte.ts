import Fuse from 'fuse.js';
import type { FuseResultMatch, IFuseOptions } from 'fuse.js';
import type { SearchRecord } from '$lib/types';

/**
 * Client-side fuzzy search. The Fuse instance is created lazily on first
 * open of the palette (~285 records — trivial cost) and cached thereafter.
 */

let fuse: Fuse<SearchRecord> | null = null;

/**
 * UI-003: `threshold: 0.4` + `ignoreLocation` let fuzzy matching drift into
 * unrelated titles (a query like "hchan" matched 61 of 285 records with
 * scattered single-character marks). 0.15 with `minMatchCharLength: 2` keeps
 * typo tolerance while collapsing the noise tail (same query now matches 1);
 * remaining multi-hit queries surface genuine same-concept clusters.
 */
const FUSE_OPTIONS: IFuseOptions<SearchRecord> = {
  includeMatches: true,
  ignoreLocation: true,
  threshold: 0.15,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'tags', weight: 0.2 },
    { name: 'subcategory', weight: 0.05 },
    { name: 'category', weight: 0.05 }
  ]
};

export interface SearchHit {
  item: SearchRecord;
  /** Matched substring ranges per key, for <mark> highlighting. */
  matches: ReadonlyArray<Pick<FuseResultMatch, 'key' | 'indices'>>;
}

export function search(query: string, index: SearchRecord[]): SearchHit[] {
  if (!fuse) {
    fuse = new Fuse<SearchRecord>(index, FUSE_OPTIONS);
  }
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];
  const results = fuse.search(trimmed);
  return results.map((r) => ({ item: r.item, matches: r.matches ?? [] }));
}
