import { DeepPartial } from 'fvtt-types/utils'
import { generateUniqueId, isNiceDiceEnabled } from '../../lib/utilities.js'
import { SvelteApplication } from '../svelte/svelte-application.ts'
import SlamCalculatorForm from './SlamCalculator.svelte'
import { t } from '../svelte/localize.ts'
import { relativeSpeed, type SlamFormState, type SlamToken } from './slam-calculator-view.ts'
import { SlamCalculator } from './slam-calc.js'

/**
 * The `/slam` calculator.
 *
 * The form used to be a `FormApplication` that re-rendered itself from a listener every time a
 * velocity changed, just to keep the relative velocity in step. The component derives that instead,
 * so this class is left with what it is actually for: finding the tokens, and handing the finished
 * numbers to `SlamCalculator`.
 */
export class SlamCalculatorApp extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'slam-calculator',
    classes: ['gurps'],
    window: {
      title: 'GURPS.slamCalculator',
      minimizable: false,
      resizable: false,
    },
  }

  #attacker: SlamToken | null
  #target: SlamToken | null
  #calculator: SlamCalculator

  constructor(attacker: SlamToken | null, target: SlamToken | null, options = {}) {
    super(options)

    this.#attacker = attacker
    this.#target = target
    this.#calculator = new SlamCalculator({
      generateUniqueId,
      sizeAndSpeedRangeTable: GURPS.SSRT,
      isNiceDiceEnabled,
      roll: Roll,
      // Both are wrapped so `game.i18n` keeps its `this` when the calculator calls them.
      localize: (text: string) => game.i18n!.localize(text),
      format: (text: string, data: Record<string, string>) => game.i18n!.format(text, data),
    })
  }

  static process(attacker: SlamToken | null, target: SlamToken | null): void {
    void new SlamCalculatorApp(attacker, target).render({ force: true })
  }

  override component = () => SlamCalculatorForm

  override props = () => ({
    attacker: this.#attacker,
    target: this.#target,
    onresolve: (state: SlamFormState) => void this.#resolve(state),
  })

  async #resolve(state: SlamFormState): Promise<void> {
    await this.#calculator.process({
      ...state,
      attackerToken: this.#attacker,
      // The calculator reads the target's name straight off the token even when nobody is targeted,
      // so an unselected target keeps the placeholder the form showed.
      targetToken: this.#target ?? { name: t('GURPS.target') },
      isRealTarget: !!this.#target,
      relativeSpeed: relativeSpeed(state),
    })
    await this.close()
  }
}
