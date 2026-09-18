import { isValidDiceTerm } from '../utilities/damage-utils.js'

/** What the slam calculator needs of a token; anything else on it is the calculator's business. */
export interface SlamToken {
  name: string
  actor: {
    system: {
      HP: { max: number }
      basicmove: { value: number | string }
      thrust: string
    }
  }
}

/** Everything the form lets a player change. */
export interface SlamFormState {
  attackerHp: number
  attackerSpeed: number
  attackerThr: string
  targetHp: number
  targetSpeed: number
  targetThr: string
  isAoAStrong: boolean
  shieldDB: number
  useDFRPGRules: boolean
}

/** A slam with nobody on the other side of it still has to roll against something. */
const UNKNOWN_HP = 10
const UNKNOWN_SPEED = 5
const UNKNOWN_THRUST = '1d-5'

/**
 * Reads the starting values off the two tokens.
 *
 * Either side may be absent: `/slam` opens the calculator with no target selected, and the attacker
 * may have no token on the canvas at all, so both fall back to the values a generic combatant has.
 * The target starts stationary -- it is the attacker who is running.
 */
export function initialSlamState(attacker: SlamToken | null, target: SlamToken | null): SlamFormState {
  return {
    attackerHp: attacker ? attacker.actor.system.HP.max : UNKNOWN_HP,
    attackerSpeed: attacker ? parseInt(String(attacker.actor.system.basicmove.value)) : UNKNOWN_SPEED,
    attackerThr: attacker ? attacker.actor.system.thrust : UNKNOWN_THRUST,
    targetHp: target ? target.actor.system.HP.max : UNKNOWN_HP,
    targetSpeed: 0,
    targetThr: target ? target.actor.system.thrust : UNKNOWN_THRUST,
    isAoAStrong: false,
    shieldDB: 0,
    useDFRPGRules: true,
  }
}

/**
 * The speed the slam actually lands at: closing speed, so a target running in gets added to the
 * attacker's move rather than subtracted from it.
 */
export function relativeSpeed(state: Pick<SlamFormState, 'attackerSpeed' | 'targetSpeed'>): number {
  return state.attackerSpeed + state.targetSpeed
}

/** Keeps a hand-typed thrust usable: anything the damage parser would reject falls back. */
export function sanitizeThrust(value: string): string {
  return isValidDiceTerm(value) ? value : UNKNOWN_THRUST
}
