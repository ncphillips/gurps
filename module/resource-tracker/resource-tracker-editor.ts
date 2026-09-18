import { DeepPartial } from 'fvtt-types/utils'
import { SvelteApplication } from '../svelte/svelte-application.ts'
import TrackerEditor from './TrackerEditor.svelte'
import type { TrackerInstance } from './types.ts'

/**
 * Edits one resource tracker.
 *
 * Both callers -- the tracker manager and the character sheet -- open this, replace
 * `_updateTracker` with what they want done on save, and read the result back off `_tracker`, so
 * that contract is kept exactly. What changed is underneath: the component holds the form and
 * publishes every edit, where the old version wrote each change from its own listener and called
 * `render(false)` afterwards to get the markup back in step.
 */
export class ResourceTrackerEditor extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'resource-tracker-editor',
    position: { width: 360 },
    window: {
      title: 'GURPS.resourceTrackerEditor',
      minimizable: false,
      resizable: false,
    },
  }

  /** The tracker as edited so far. Callers read this when `_updateTracker` fires. */
  _tracker: TrackerInstance

  constructor(tracker: TrackerInstance, options = {}) {
    super(options)

    this._tracker = tracker
  }

  /** By default, do nothing. Each specific use will need its own update method. */
  async _updateTracker(): Promise<void> {}

  override component = () => TrackerEditor

  override props = () => ({
    tracker: this._tracker,
    onchange: (tracker: TrackerInstance) => {
      this._tracker = tracker
    },
    onupdate: () => void this._updateTracker(),
    oninvalidalias: (alias: string) => {
      ui.notifications?.warn(game.i18n!.format('GURPS.resourceInvalidAlias', { alias }))
    },
  })
}
