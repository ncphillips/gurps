import { DeepPartial } from 'fvtt-types/utils'
import { commitUpdate, replaceValue } from '../utilities/foundry-compat.ts'
import { SvelteApplication } from '../svelte/svelte-application.ts'
import MoveModeEditorForm from './MoveModeEditor.svelte'
import { defaultModeUpdate, withAddedMode, withoutMode, type MoveMode, type MoveModes } from './move-mode-view.ts'

/**
 * What the editor needs of an actor.
 *
 * `system` is left opaque because the data model does not declare `move`: it is filled in from the
 * actor's basic move the first time a sheet renders, and `#modes` is the one place that reads it.
 */
interface MoveModeActor {
  name?: string
  system: object
  update(data: Record<string, unknown>): Promise<unknown>
}

/**
 * The editor behind an actor sheet's move modes.
 *
 * Every edit goes to the actor, and the actor is what the component renders, so the window redraws
 * from `updateActor` the same way it would if another client made the change. The old version
 * re-rendered itself by hand at the end of each handler instead, which is why an edit made
 * elsewhere left this window stale.
 */
export default class MoveModeEditor extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'move-mode-editor',
    classes: ['sheet'],
    position: { width: 400 },
    window: { resizable: false },
  }

  #actor: MoveModeActor
  #onActorUpdate: (actor: { id?: string | null }) => void

  constructor(actor: MoveModeActor, options = {}) {
    super(options)

    this.#actor = actor
    this.#onActorUpdate = updated => {
      if (updated === (actor as unknown as { id?: string | null })) void this.render({ force: false })
    }
  }

  override get title(): string {
    return game.i18n?.format('GURPS.moveModeEditorTitle', { name: this.#actor.name ?? 'UNKNOWN' }) ?? ''
  }

  override component = () => MoveModeEditorForm

  override props = () => ({
    modes: this.#modes,
    onadd: () => void this.#replaceModes(withAddedMode(this.#modes)),
    ondelete: (key: string) => void this.#replaceModes(withoutMode(this.#modes, key)),
    onchoosedefault: (key: string) => void this.#actor.update(defaultModeUpdate(this.#modes, key)),
    onedit: (key: string, field: 'mode' | 'basic' | 'enhanced', value: string) => void this.#edit(key, field, value),
  })

  protected override async _onRender(context: object, options: object): Promise<void> {
    await super._onRender(context, options)
    Hooks.on('updateActor', this.#onActorUpdate)
  }

  protected override async _onClose(options: object): Promise<void> {
    Hooks.off('updateActor', this.#onActorUpdate)
    await super._onClose(options)
  }

  get #modes(): MoveModes {
    return ((this.#actor.system as { move?: MoveModes }).move ?? {}) as MoveModes
  }

  /**
   * Writes one field of one row.
   *
   * The whole row is written rather than the single field: a move mode may never have been saved --
   * the actor's first one is filled in from its basic move when the sheet loads -- so updating
   * `system.move.00000.basic` alone can land on a row that is not in the database yet.
   */
  async #edit(key: string, field: 'mode' | 'basic' | 'enhanced', value: string): Promise<void> {
    const mode = this.#modes[key]
    if (!mode) return

    const updated: MoveMode = { ...mode, [field]: value }
    await this.#actor.update({ [`system.move.${key}`]: updated })
  }

  /**
   * Replaces the whole move list.
   *
   * Adding and deleting renumber the keys, so the stored object has to be replaced rather than
   * merged -- a merge would leave the old trailing row behind.
   */
  async #replaceModes(modes: MoveModes): Promise<void> {
    await commitUpdate(this.#actor as never, replaceValue('system.move', modes))
  }
}
