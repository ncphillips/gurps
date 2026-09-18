import { DeepPartial } from 'fvtt-types/utils'
import * as Settings from '../../lib/miscellaneous-settings.js'
import { SvelteApplication } from '../svelte/svelte-application.ts'
import QuickRollSettingsForm from './QuickRollSettings.svelte'
import { readQuickRollSettings, type QuickRollSettingsData } from './quick-roll-settings-view.ts'

/**
 * The editor behind the "Quick Rolls" settings menu.
 *
 * The component owns the form: it edits a copy of the setting and hands the result back through
 * `onsave`, which is why this class no longer registers a `form` handler of its own.
 */
class QuickRollSettings extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'quick-roll-settings',
    window: {
      title: 'GURPS.settingUseQuickRolls',
    },
    position: {
      width: 400,
    },
  }

  override component = () => QuickRollSettingsForm

  override props = () => ({
    settings: readQuickRollSettings(game.settings?.get(Settings.SYSTEM_NAME, Settings.SETTING_USE_QUICK_ROLLS)),
    onsave: (settings: QuickRollSettingsData) => void this.#save(settings),
  })

  async #save(settings: QuickRollSettingsData): Promise<void> {
    await game.settings?.set(Settings.SYSTEM_NAME, Settings.SETTING_USE_QUICK_ROLLS, settings)
    await this.close()
  }
}

export { QuickRollSettings }
