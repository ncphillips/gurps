/**
 * Move arithmetic, kept out of GurpsActor so the rules can be exercised without a Foundry actor.
 */

/**
 * The Move left to a character by a posture or maneuver that allows only a fraction of it.
 *
 * The fraction is taken as a numerator and denominator rather than a ratio so that 2/3 of Move 3 is
 * 2 and not the 1 that `Math.floor(3 * (2 / 3))` produces.
 *
 * Fractions round down. B9 makes that the default for any math deciding "what a character can do"
 * and says rules "always explicitly note any exceptions"; the posture table (B551) and the
 * half-Move maneuvers (B365, B366) note none. B387 states the same postures as movement point
 * surcharges, which floor by construction because nobody enters a fraction of a hex.
 *
 * The one-yard floor is B387: "You can *always* move at least one hex per turn, no matter how
 * severe the penalties."
 */
export function fractionOfMove(move: number, numerator: number, denominator: number): number {
  return Math.max(1, Math.floor((move * numerator) / denominator))
}

/** The conditions that halve Move: reeling from wounds (B380) and very tired (B426). */
export interface MoveConditions {
  reeling?: boolean
  exhausted?: boolean
}

/**
 * The Move a character has before any posture or maneuver limits it.
 *
 * The order is the books'. B17 defines Move as "your Basic Move modified for your encumbrance
 * level," so encumbrance takes its share first, dropping the fraction it leaves per B9. B380 and
 * B426 then halve "your Move" -- the score encumbrance has already made -- each rounding up, as
 * both rules say in so many words.
 *
 * The encumbrance level is applied as tenths rather than as a ratio so that Light encumbrance
 * leaves an exact 0.8 of Basic Move rather than a float a hair under or over it.
 */
export function currentMove(basicMove: number, encumbranceLevel: number, conditions: MoveConditions = {}): number {
  let move = Math.floor((basicMove * (10 - 2 * encumbranceLevel)) / 10)
  if (conditions.reeling) move = Math.ceil(move / 2)
  if (conditions.exhausted) move = Math.ceil(move / 2)
  return move
}

/**
 * The distance a character can step: 1/10 of Move, never less than one yard, rounding up (B368).
 *
 * `move` is the Move score -- Basic Move after encumbrance and the conditions -- and deliberately
 * not the Move a posture or maneuver has left. B387: a step is your full step "regardless of
 * facing, posture, or terrain."
 */
export function step(move: number): number {
  return Math.max(1, Math.ceil(move / 10))
}

/**
 * The furthest a token may move this turn under a maneuver that allows a fraction of Move.
 *
 * `fullMove` is the Move a posture or maneuver has not yet touched; `currentMove` is what the actor
 * settled on after both. Taking the lower of the two is what makes this safe to ask twice: when
 * "Maneuver Updates Move" is on, `currentMove` already has the maneuver's fraction taken out of it,
 * and re-applying the fraction would take half of a half. It also keeps a posture that holds Move
 * below what the maneuver allows in force.
 */
export function maneuverMove(fullMove: number, currentMove: number, numerator: number, denominator: number): number {
  return Math.min(fractionOfMove(fullMove, numerator, denominator), currentMove)
}
