import { DeepPartial } from 'fvtt-types/utils'
import * as Settings from '../../lib/miscellaneous-settings.js'
import { arrayToObject, objectToArray } from '../../lib/utilities.js'
import { SvelteApplication } from '../svelte/svelte-application.ts'
import SelectJournals from './SelectJournals.svelte'
import { journalChoices, type JournalPageLike } from './journal-list.ts'

/**
 * Picks which journal pages the modifier bucket offers.
 *
 * The old version read the checked boxes back out of the DOM on submit -- via the event's
 * `currentTarget`, which is the form, not the list -- so the component keeps the selection and
 * hands over the ids.
 */
export default class ModifierBucketJournals extends SvelteApplication {
  static override DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    id: 'modifier-journals',
    position: { width: 550 },
    window: {
      title: 'GURPS.modifierJournalManager',
      minimizable: false,
      resizable: true,
    },
  }

  /** The ids the bucket is currently showing. */
  static getJournalIds(): string[] {
    return objectToArray(game.settings!.get(Settings.SYSTEM_NAME, Settings.SETTING_BUCKET_JOURNALS))
  }

  override component = () => SelectJournals

  override props = () => ({
    choices: this.#choices(),
    selected: ModifierBucketJournals.getJournalIds(),
    onsave: (ids: string[]) => void this.#save(ids),
  })

  #choices() {
    const pages: JournalPageLike[] = []
    for (const journal of game.journal!) pages.push(...(journal.pages as unknown as JournalPageLike[]))

    return journalChoices(
      pages,
      game.folders as unknown as { get(id: string): { name: string; parent?: { id: string } | null } | undefined },
      page =>
        (page as unknown as { testUserPermission(user: unknown, level: string): boolean }).testUserPermission(
          game.user,
          'OBSERVER'
        )
    )
  }

  async #save(ids: string[]): Promise<void> {
    await game.settings!.set(Settings.SYSTEM_NAME, Settings.SETTING_BUCKET_JOURNALS, arrayToObject(ids))
    await this.close()
  }
}
