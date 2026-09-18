// BACKPORTED from v1.0.0

import { SvelteApplication } from '../svelte/svelte-application.ts'
import GurpsSettingsForm from './GurpsSettings.svelte'
import { settingUpdates, settingsForModule, type SettingEntry } from './settings-view.ts'

// define an object with two fields: title and icon.
type GurpsSettingsConfig = {
  title: string // Title of the Settings window.
  module: string // Name of the GURPS module.
  icon?: string // Icon to display in the title bar.
}

/**
 * GURPS Settings Application.
 *
 * This application is used to display and manage settings for a specific GURPS module. Settings are determined by the
 * module name passed in the constructor.
 *
 * Pass in a configuration object with the following fields:
 * - title: The title of the settings window.
 * - module: The name of the GURPS module for which settings are being managed.
 * - icon: (optional) The icon to display in the title bar.
 *
 * Module settings are registered with the namespace `gurps.<module>.<settingId>`.
 * For example, if the module is "damage", a setting with ID "useArmorDivisor" would be registered as
 * `gurps.damage.useArmorDivisor`.
 */
export class GurpsSettingsApplication extends SvelteApplication {
  constructor(config: GurpsSettingsConfig, options?: object) {
    super(options)

    this._title = config.title
    this._module = config.module
    this.options.window.icon = config.icon ?? 'fa-solid fa-gears'
  }

  private _title: string
  private _module: string

  override get title() {
    return this._title
  }

  static override DEFAULT_OPTIONS = {
    classes: ['gga', 'standard-form'],
    id: 'gga-settings',
    position: {
      width: 600,
      height: 600,
    },
    window: {
      resizable: true,
      icon: 'fa-light fa-face-head-bandage',
    },
  }

  override component = () => GurpsSettingsForm

  override props = () => ({
    entries: this.#entries(),
    onsave: (form: HTMLFormElement) => void this.#save(form),
  })

  /**
   * The module's settings, each paired with a `DataField` that can draw it.
   *
   * A setting registered the old way names a constructor -- `Boolean`, `Number`, a string with
   * `choices` -- rather than a field, so those are converted here; the window then has one kind of
   * thing to render regardless of how the setting was declared.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #entries(): SettingEntry<any>[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = settingsForModule(game.settings!.settings.values() as Iterable<any>, this._module)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return settings.map((setting: any) => {
      const field = this.#fieldFor(setting)

      field.name = `${setting.namespace}.${setting.key}`
      field.label ||= game.i18n!.localize(setting.name ?? '')
      field.hint ||= game.i18n!.localize(setting.hint ?? '')

      return { field, value: game.settings!.get(GURPS.SYSTEM_NAME, setting.key) }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fieldFor(setting: any): any {
    if (setting.type instanceof foundry.data.fields.DataField) return setting.type

    if (setting.type === Boolean) {
      return new foundry.data.fields.BooleanField({ initial: setting.default ?? false })
    }

    if (setting.type === Number) {
      const { min, max, step } = setting.range ?? {}

      return new foundry.data.fields.NumberField({
        required: true,
        choices: setting.choices,
        initial: setting.default,
        min,
        max,
        step,
      })
    }

    return new foundry.data.fields.StringField({
      required: true,
      nullable: false,
      choices: setting.choices,
      initial: setting.default,
    })
  }

  async #save(form: HTMLFormElement): Promise<void> {
    // `FormDataExtended` is what turns the form's strings back into the booleans and numbers the
    // settings were registered as.
    const submitted = new FormDataExtended(form).object as Record<string, unknown>

    for (const update of settingUpdates(submitted, GURPS.SYSTEM_NAME)) {
      // The ids come from the settings the window itself listed, but they are strings as far as the
      // types are concerned, and the registry is keyed by literal.
      await game.settings!.set(GURPS.SYSTEM_NAME, update.id as never, update.value as never)
    }

    await this.close()
  }
}
