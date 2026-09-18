import { DeepPartial } from 'fvtt-types/utils'
import { SvelteApplication } from '../svelte/svelte-application.ts'
import PdfSettingsForm from './PdfSettings.svelte'
import { MODULE_NAME, SETTING_BASICSET_PDF, SETTING_PDF_OPEN_FIRST } from './types.js'

export function registerPDFSettings() {
  if (!game.settings) throw new Error('GURPS | PDF module requires game.settings to be available!')

  game.settings.register(GURPS.SYSTEM_NAME, SETTING_BASICSET_PDF, {
    name: 'GURPS.settingBasicPDFs',
    hint: 'GURPS.settingHintBasicPDFs',
    scope: 'world',
    config: false,
    type: String as any,
    // @ts-expect-error: choices may not be typed in Foundry's API
    choices: {
      Combined: 'GURPS.settingBasicPDFsCombined',
      Separate: 'GURPS.settingBasicPDFsSeparate',
      Revised: 'GURPS.settingBasicPDFsRevised',
    },
    default: 'Combined',
    onChange: value => console.log(`Basic Set PDFs : ${value}`),
  })

  game.settings.register(GURPS.SYSTEM_NAME, SETTING_PDF_OPEN_FIRST, {
    name: 'GURPS.settingPDFOpenFirst',
    hint: 'GURPS.settingHintPDFOpenFirst',
    scope: 'world',
    config: false,
    type: Boolean as any,
    default: false, // Migrate old setting if needed
    onChange: value => console.log(`On multiple Page Refs open first PDF found : ${value}`),
  })

  game.settings.registerMenu(GURPS.SYSTEM_NAME, MODULE_NAME, {
    name: 'GURPS.pdf.settingsName',
    hint: 'GURPS.pdf.settingsHint',
    label: 'GURPS.pdf.settingsButton',
    type: PDFSettingsApplication,
    restricted: false,
    icon: 'fa-solid fa-file-pdf',
  })
}

export function isOpenFirstPDFSetting(): boolean {
  return game.settings?.get(GURPS.SYSTEM_NAME, SETTING_PDF_OPEN_FIRST) ?? false
}

export function getBasicSetPDFSetting(): string {
  return game.settings?.get(GURPS.SYSTEM_NAME, SETTING_BASICSET_PDF) as string
}

/**
 * The PDF settings menu.
 *
 * The component owns the form and hands the edited settings back through `onsave`, so there is no
 * `FormDataExtended` to read fields out of by name, and no footer part to borrow from Foundry.
 */
class PDFSettingsApplication extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'pdf-settings',
    classes: ['standard-form'],
    window: {
      title: 'GURPS.pdf.settingsButton',
    },
    position: {
      width: 400,
    },
  }

  override component = () => PdfSettingsForm

  override props = () => ({
    basicSet: getBasicSetPDFSetting(),
    openFirst: isOpenFirstPDFSetting(),
    onsave: (settings: { basicSet: string; openFirst: boolean }) => void this.#save(settings),
  })

  async #save(settings: { basicSet: string; openFirst: boolean }): Promise<void> {
    await game.settings!.set(GURPS.SYSTEM_NAME, SETTING_BASICSET_PDF, settings.basicSet)
    await game.settings!.set(GURPS.SYSTEM_NAME, SETTING_PDF_OPEN_FIRST, settings.openFirst)
    await this.close()
  }
}
