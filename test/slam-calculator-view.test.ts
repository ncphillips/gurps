import { initialSlamState, relativeSpeed, sanitizeThrust, type SlamToken } from '../module/chat/slam-calculator-view.ts'

function token(name: string, hp: number, move: number | string, thrust: string): SlamToken {
  return { name, actor: { system: { HP: { max: hp }, basicmove: { value: move }, thrust } } }
}

describe('initialSlamState', () => {
  it('reads both combatants off their tokens', () => {
    const state = initialSlamState(token('Brent', 12, 6, '1d-1'), token('Goblin', 8, 5, '1d-3'))

    expect(state).toMatchObject({
      attackerHp: 12,
      attackerSpeed: 6,
      attackerThr: '1d-1',
      targetHp: 8,
      targetThr: '1d-3',
    })
  })

  it('starts the target stationary, however fast it can move', () => {
    expect(initialSlamState(null, token('Goblin', 8, 5, '1d-3')).targetSpeed).toBe(0)
  })

  it('falls back to a generic combatant when there is no token', () => {
    const state = initialSlamState(null, null)

    expect(state).toMatchObject({
      attackerHp: 10,
      attackerSpeed: 5,
      attackerThr: '1d-5',
      targetHp: 10,
      targetThr: '1d-5',
    })
  })

  it('reads a basic move that the actor stored as a string', () => {
    expect(initialSlamState(token('Brent', 12, '7', '1d-1'), null).attackerSpeed).toBe(7)
  })

  it('opens with the DFRPG rules and no all-out attack', () => {
    expect(initialSlamState(null, null)).toMatchObject({ useDFRPGRules: true, isAoAStrong: false, shieldDB: 0 })
  })
})

describe('relativeSpeed', () => {
  it('adds the two velocities, because they are closing', () => {
    expect(relativeSpeed({ attackerSpeed: 6, targetSpeed: 4 })).toBe(10)
  })
})

describe('sanitizeThrust', () => {
  it('keeps a valid dice term', () => {
    expect(sanitizeThrust('2d+1')).toBe('2d+1')
  })

  it('replaces something the damage parser would reject', () => {
    expect(sanitizeThrust('lots')).toBe('1d-5')
  })
})
