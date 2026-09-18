import { DeepPartial } from 'fvtt-types/utils'
import { SvelteApplication } from '../module/svelte/svelte-application.ts'
import ChangeLog from './ChangeLog.svelte'
import { trimChangelog } from './changelog-view.ts'
import './markdown-it.js'
import { SemanticVersion } from './semver.js'

const CHANGELOG_URL = 'systems/gurps/changelog.md'

/**
 * The "what changed" window shown after the system updates.
 *
 * It was a `FormApplication` whose `getData` returned a promise it resolved from an `XMLHttpRequest`
 * callback -- and never resolved at all if the request failed, leaving the window empty forever.
 * The component awaits the fetch itself, so a failed request says so.
 */
export class ChangeLogWindow extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'changelog',
    classes: ['gurps', 'changelog'],
    position: { width: 700 },
  }

  #lastVersion: SemanticVersion | null

  constructor(lastVersion: SemanticVersion | null = null, options = {}) {
    super(options)

    this.#lastVersion = lastVersion
  }

  override get title(): string {
    const name = game.i18n?.localize('GURPS.changelog.title') ?? ''
    return `${name} ~ ${game.i18n?.localize('GURPS.changelog.readme') ?? ''}`
  }

  override component = () => ChangeLog

  override props = () => ({ load: () => this.#load() })

  async #load(): Promise<string> {
    const response = await fetch(CHANGELOG_URL)
    if (!response.ok) throw new Error(`Could not read ${CHANGELOG_URL}: ${response.status}`)

    const markdown = trimChangelog(await response.text(), this.#lastVersion)

    return (window as unknown as { markdownit(): { render(md: string): string } }).markdownit().render(markdown)
  }
}
