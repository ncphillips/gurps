import type { ResourceTrackerThreshold, TrackerInstance } from './types.ts'

/**
 * Aliases name a resource in an On-the-Fly formula, so they may only contain the characters a
 * formula can carry. `+` and `-` are in the set because the damage-type trackers are named after
 * damage abbreviations: `pi-`, `pi+`, `pi++`.
 */
const ALIAS = /^[A-Za-z0-9_+-]+$/

export function isValidAlias(alias: string): boolean {
  return ALIAS.test(alias)
}

/** How a threshold compares the tracker's value against its bound. */
export const COMPARISONS = ['>', '≥', '<', '≤'] as const

/** How a threshold's bound is derived from the tracker's maximum. */
export const OPERATORS = ['+', '−', '×', '÷'] as const

/** A blank tracker -- what the editor's reset button restores. */
export function emptyTracker(): TrackerInstance {
  return {
    name: '',
    alias: '',
    pdf: '',
    max: 0,
    min: 0,
    value: 0,
    isDamageTracker: false,
    isDamageType: false,
    breakpoints: true,
    thresholds: [],
  }
}

/**
 * A new threshold row.
 *
 * It starts at the maximum -- `× 1` -- because a threshold that is already crossed the moment it is
 * added would recolour the tracker before anybody has said what it means.
 */
export function newThreshold(condition: string): ResourceTrackerThreshold {
  return { comparison: '>', operator: '×', value: 1, condition, color: '#FFFFFF' }
}
