import { currentMove, fractionOfMove, maneuverMove, step } from '../module/actor/move.js'

/**
 * B9 sets the default: when math decides "what a character can do," fractions round *down*, and
 * "Rules always explicitly note any exceptions." The posture table (B551) gives Crouching 2/3 Move
 * and Kneeling and Crawling 1/3, noting no exception, so the default stands.
 *
 * B387 is the clincher. It restates those same postures as movement point surcharges -- Crouching
 * +1/2 MP per hex, Kneeling and Crawling +2 -- which work out to the same fractions (Move/1.5 and
 * Move/3) by a route that cannot help but floor them, since nobody enters a fraction of a hex.
 * Rounding up would put the two halves of the Basic Set in direct contradiction.
 *
 * The same default governs the maneuvers that allow a fraction of Move: B365 and B366 say "up to
 * half your Move" and note no exception either.
 */
describe('fractionOfMove', () => {
  it('leaves a crouching Move 5 character 3 yards', () => {
    expect(fractionOfMove(5, 2, 3)).toBe(3)
  })

  it('leaves a kneeling Move 5 character 1 yard', () => {
    expect(fractionOfMove(5, 1, 3)).toBe(1)
  })

  it('leaves a Move 5 character taking a half-Move maneuver 2 yards', () => {
    expect(fractionOfMove(5, 1, 2)).toBe(2)
  })

  test('the fraction divides evenly', () => {
    expect(fractionOfMove(6, 2, 3)).toBe(4)
  })

  // B387: "You can *always* move at least one hex per turn, no matter how severe the penalties."
  it('leaves a kneeling Move 2 character 1 yard rather than none', () => {
    expect(fractionOfMove(2, 1, 3)).toBe(1)
  })
})

/**
 * The order these reductions apply in is fixed by the books' own definitions. B17 defines Move as
 * "your Basic Move modified for your encumbrance level" -- encumbrance is part of what makes the
 * Move score, and B9 drops the fraction it leaves. B380 and B426 then say to halve "your Move,"
 * meaning the score you already have, so the conditions come second.
 *
 * Both conditions round *up*: B380 says "Halve your Basic Speed and Move (round up)" and B426 says
 * "Halve your Move, Dodge, and ST (round *up*)." Those are the explicit exceptions B9 anticipates.
 */
describe('currentMove', () => {
  it('reduces Basic Move to 0.8 of itself under Light encumbrance', () => {
    expect(currentMove(10, 1)).toBe(8)
  })

  it('drops the fraction encumbrance leaves', () => {
    expect(currentMove(14, 1)).toBe(11)
  })

  it('halves the Move of a reeling character, rounding up', () => {
    expect(currentMove(5, 0, { reeling: true })).toBe(3)
  })

  it('halves the Move of a very tired character, rounding up', () => {
    expect(currentMove(5, 0, { exhausted: true })).toBe(3)
  })

  test('the character is both reeling and very tired', () => {
    expect(currentMove(5, 0, { reeling: true, exhausted: true })).toBe(2)
  })

  // Basic Move 14 under Light encumbrance is 11, which reeling halves to 6. Halving first gives 7,
  // and encumbrance then cuts that to 5.
  test('a reeling character under Light encumbrance', () => {
    expect(currentMove(14, 1, { reeling: true })).toBe(6)
  })
})

/**
 * B368: "You may step a distance equal to 1/10 your Move, but never less than one yard. Round all
 * fractions *up*. Thus, Move 1-10 gives a one-yard step, Move 11-20 gives a two-yard step."
 *
 * "Your Move" is the Move score -- Basic Move after encumbrance (B17) and after reeling (B380) and
 * fatigue (B426) -- not Basic Move. It is not reduced further by whatever posture or maneuver is
 * holding Move back: B387 says a step is your full step "regardless of facing, posture, or
 * terrain."
 */
describe('step', () => {
  it('gives a Move 5 character a one-yard step', () => {
    expect(step(5)).toBe(1)
  })

  it('gives a Move 10 character a one-yard step', () => {
    expect(step(10)).toBe(1)
  })

  it('gives a Move 11 character a two-yard step', () => {
    expect(step(11)).toBe(2)
  })

  it('gives a Move 20 character a two-yard step', () => {
    expect(step(20)).toBe(2)
  })

  it('gives a Move 0 character a one-yard step', () => {
    expect(step(0)).toBe(1)
  })
})

/**
 * The Combat Tracker's maneuver menu shows how far a token may move, and works it out from the
 * maneuver's fraction (B365, B366) rather than reading system.currentmove. But currentmove has
 * already had that same fraction taken out of it when "Maneuver Updates Move" is on, so applying it
 * again took half of a half. Taking the lower of the two numbers instead is idempotent, and still
 * respects a posture holding Move below what the maneuver allows.
 */
describe('maneuverMove', () => {
  it('allows half of an unrestricted Move 5', () => {
    expect(maneuverMove(5, 5, 1, 2)).toBe(2)
  })

  test("the actor has already taken the maneuver's half out of its Move", () => {
    expect(maneuverMove(5, 2, 1, 2)).toBe(2)
  })

  // A kneeling Move 5 character has Move 1. Aiming does not give them back a second yard.
  test('a posture holds Move below what the maneuver allows', () => {
    expect(maneuverMove(5, 1, 1, 2)).toBe(1)
  })
})
