/**
 * The move modes the system knows by name.
 *
 * The values are catalogue keys, and an actor may also carry a mode a player typed by hand, so
 * anything reading `system.move.*.mode` has to treat these as the known subset rather than the
 * whole set.
 *
 * They live here rather than in `actor.ts` so a unit test can reach them without pulling in the
 * actor -- which registers Foundry hooks the moment it is imported.
 */
export const MoveModes = {
  Ground: 'GURPS.moveModeGround',
  Air: 'GURPS.moveModeAir',
  Water: 'GURPS.moveModeWater',
  Space: 'GURPS.moveModeSpace',
} as const

export type MoveModeKey = (typeof MoveModes)[keyof typeof MoveModes]
