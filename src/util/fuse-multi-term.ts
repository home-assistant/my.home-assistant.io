// Adapted from frontend: https://github.com/home-assistant/frontend/blob/3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af/src/resources/fuseMultiTerm.ts
import type { FuseIndex, IFuseOptions } from "fuse.js";
import Fuse from "fuse.js";

function searchTerm<T>(
  items: T[],
  search: string,
  fuseIndex: FuseIndex<T>,
  options: IFuseOptions<T>,
) {
  return new Fuse(
    items,
    {
      ignoreDiacritics: true,
      isCaseSensitive: false,
      threshold: 0.3,
      minMatchCharLength: Math.min(search.length, 2),
      ignoreLocation: true,
      ...options,
    },
    fuseIndex,
  ).search(search);
}

/** Match every term across the indexed fields, ranked by combined relevance. */
export function multiTermSortedSearch<T>(
  items: T[],
  search: string,
  getItemId: (item: T) => string,
  fuseIndex: FuseIndex<T>,
): T[] {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);

  if (!terms.length) {
    return items;
  }

  if (terms.length === 1) {
    return searchTerm(items, terms[0], fuseIndex, {}).map(({ item }) => item);
  }

  const results = new Map<string, { item: T; hits: number; score: number }>();

  for (const term of terms) {
    const matches = searchTerm(items, term, fuseIndex, {
      shouldSort: false,
      includeScore: true,
    });

    if (!matches.length) {
      return [];
    }

    for (const match of matches) {
      const id = getItemId(match.item);
      const result = results.get(id) ?? { item: match.item, hits: 0, score: 0 };
      result.hits += 1;
      // Summing negative logs combines Fuse scores without underflow.
      result.score += -Math.log(match.score || Number.MIN_VALUE);
      results.set(id, result);
    }
  }

  return Array.from(results.values())
    .filter(({ hits }) => hits === terms.length)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
