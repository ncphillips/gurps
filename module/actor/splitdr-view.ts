/**
 * A hit location's split DR: some of its DR applies only to one damage type.
 *
 * The actor stores it as a single-entry object keyed by the damage type, which is why every read
 * here goes through `readSplit` rather than indexing a known field.
 */
export interface SplitDr {
  type: string
  value: number
}

/** What a newly added split starts as -- the entry the editor has always created. */
export const NEW_SPLIT: SplitDr = { type: 'none', value: 0 }

/** The split a location carries, or `null` while it has none. */
export function readSplit(split: Record<string, number> | undefined | null): SplitDr | null {
  const entry = Object.entries(split ?? {})[0]
  if (!entry) return null

  return { type: entry[0], value: Number(entry[1]) }
}

/**
 * The damage types the dropdown offers.
 *
 * A location may already name a type outside the table -- a player typed it, or the table changed
 * since -- so it is appended; without it the select would show the first option instead of the
 * location's own.
 */
export function damageTypeOptions(known: string[], current: string): string[] {
  return known.includes(current) ? known : [...known, current]
}
