import { DeepPartial } from 'fvtt-types/utils'
import { deleteKey } from '../utilities/foundry-compat.ts'
import { SvelteApplication } from '../svelte/svelte-application.ts'
import SplitDrEditorForm from './SplitDrEditor.svelte'
import { NEW_SPLIT, readSplit } from './splitdr-view.ts'

interface SplitDrActor {
  update(data: Record<string, unknown>): Promise<unknown>
}

interface HitLocation {
  where?: string
  split?: Record<string, number>
}

/**
 * The editor behind a hit location's split DR.
 *
 * Like the move mode editor, the window follows the actor: every edit writes through and
 * `updateActor` brings the change back, instead of each handler re-rendering the window itself.
 */
export default class SplitDREditor extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'splitdr-editor',
    classes: ['sheet'],
    position: { width: 300 },
    window: { resizable: false },
  }

  #actor: SplitDrActor
  /** The path to the hit location on the actor, e.g. `system.hitlocations.00003`. */
  #key: string
  #onActorUpdate: (updated: unknown) => void

  constructor(actor: SplitDrActor, key: string, options = {}) {
    super(options)

    this.#actor = actor
    this.#key = key
    this.#onActorUpdate = updated => {
      if (updated === actor) void this.render({ force: false })
    }
  }

  override get title(): string {
    return game.i18n?.format('GURPS.drSplitEditorTitle', { where: this.#location.where ?? '' }) ?? ''
  }

  override component = () => SplitDrEditorForm

  override props = () => ({
    split: readSplit(this.#location.split),
    // The table is built from the current language at startup; its values are the abbreviations.
    damageTypes: Object.values(GURPS.DamageTables.translationTable ?? {}),
    oncreate: () => void this.#actor.update({ [`${this.#key}.split`]: { [NEW_SPLIT.type]: NEW_SPLIT.value } }),
    ondelete: () => void this.#actor.update(deleteKey(`${this.#key}.split`)),
    onchangetype: (type: string) => void this.#changeType(type),
    onchangevalue: (value: number) => void this.#changeValue(value),
  })

  protected override async _onRender(context: object, options: object): Promise<void> {
    await super._onRender(context, options)
    Hooks.on('updateActor', this.#onActorUpdate)
  }

  protected override async _onClose(options: object): Promise<void> {
    Hooks.off('updateActor', this.#onActorUpdate)
    await super._onClose(options)
  }

  get #location(): HitLocation {
    return (foundry.utils.getProperty(this.#actor, this.#key) ?? {}) as HitLocation
  }

  /**
   * Re-keys the split under a new damage type.
   *
   * The damage type is the key, so changing it means deleting the old entry first: a plain update
   * would merge, leaving the location split two ways.
   */
  async #changeType(type: string): Promise<void> {
    const current = readSplit(this.#location.split)
    if (!current || current.type === type) return

    await this.#actor.update(deleteKey(`${this.#key}.split`))
    await this.#actor.update({ [`${this.#key}.split`]: { [type]: current.value } })
  }

  async #changeValue(value: number): Promise<void> {
    const current = readSplit(this.#location.split)
    if (!current) return

    await this.#actor.update({ [`${this.#key}.split.${current.type}`]: value })
  }
}
