import { zeroFill } from '../../lib/utilities.js'
import { MoveModes } from './move-modes.ts'

/** One row of `actor.system.move`. */
export interface MoveMode {
  /** A catalogue key for one of the known modes, or text a player typed. */
  mode: string
  basic: number | string
  enhanced?: number | string
  /** Older actors stored this as the string `'true'`, so read it through `isDefaultMode`. */
  default: boolean | string
}

/** `actor.system.move`, keyed by the zero-filled index the rest of the system uses. */
export type MoveModes = Record<string, MoveMode>

/** The mode a new row starts as -- the literal the editor has always created. */
export const NEW_MODE = 'other'

/**
 * The modes the dropdown offers.
 *
 * A mode a player typed by hand is not in the known set, so it is appended: without it the select
 * would have no option matching the row's own value and would silently show the first one instead.
 */
export function moveModeOptions(mode: string): string[] {
  const known: string[] = [MoveModes.Ground, MoveModes.Air, MoveModes.Water, MoveModes.Space]

  return isKnownMode(mode) ? known : [...known, mode]
}

/** Whether the row's mode is one the system names, as opposed to text a player typed. */
export function isKnownMode(mode: string): boolean {
  return ([MoveModes.Ground, MoveModes.Air, MoveModes.Water, MoveModes.Space] as string[]).includes(mode)
}

/** Actors imported by older versions stored the flag as a string. */
export function isDefaultMode(mode: MoveMode | undefined): boolean {
  return mode?.default === true || mode?.default === 'true'
}

/** A row may only be deleted while it is not the default: something has to carry the actor's move. */
export function canDeleteMode(modes: MoveModes, key: string): boolean {
  return !isDefaultMode(modes[key])
}

/** With one mode there is nothing to choose between, so the radio-like default is left alone. */
export function canChooseDefault(modes: MoveModes): boolean {
  return Object.keys(modes).length > 1
}

function copyOf(mode: MoveMode): MoveMode {
  return { mode: mode.mode, basic: mode.basic, enhanced: mode.enhanced, default: mode.default }
}

/** The next free zero-filled key, matching what `GURPS.put` would allocate. */
function nextKey(modes: MoveModes): string {
  let index = 0
  while (Object.hasOwn(modes, zeroFill(index))) index++

  return zeroFill(index)
}

/**
 * The move list with one more row on the end.
 *
 * The first row an actor gets is its default, because an actor whose every mode is non-default has
 * no move at all.
 */
export function withAddedMode(modes: MoveModes): MoveModes {
  const next: MoveModes = Object.fromEntries(Object.entries(modes).map(([key, mode]) => [key, copyOf(mode)]))

  next[nextKey(next)] = { mode: NEW_MODE, basic: 0, default: Object.keys(modes).length === 0 }

  return next
}

/**
 * The move list without one row, renumbered.
 *
 * The keys are positional, so the survivors are re-keyed from zero rather than left with a hole.
 */
export function withoutMode(modes: MoveModes, key: string): MoveModes {
  const next: MoveModes = {}

  for (const [existing, mode] of Object.entries(modes)) {
    if (existing === key) continue
    next[nextKey(next)] = copyOf(mode)
  }

  return next
}

/**
 * The update that makes one row the default and clears the rest.
 *
 * Every row is named explicitly, rather than only the two that change, because the flag is what the
 * actor reads its move from and two rows claiming it is worse than none.
 */
export function defaultModeUpdate(modes: MoveModes, key: string): Record<string, boolean> {
  return Object.fromEntries(Object.keys(modes).map(existing => [`system.move.${existing}.default`, existing === key]))
}
