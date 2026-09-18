<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity'
  import { t } from '../svelte/localize.ts'
  import type { JournalChoice } from './journal-list.ts'

  interface Props {
    /** Every text journal page the user may observe. */
    choices: JournalChoice[]
    /** The ids currently shown in the modifier bucket. */
    selected: string[]
    onsave: (ids: string[]) => void
  }

  let { choices, selected, onsave }: Props = $props()

  // svelte-ignore state_referenced_locally -- the stored selection is read once, at mount.
  const picked = new SvelteSet(selected)

  function toggle(id: string, on: boolean): void {
    if (on) picked.add(id)
    else picked.delete(id)
  }
</script>

<form
  id="select-bucket-journals"
  autocomplete="off"
  class="gga-app"
  onsubmit={event => (event.preventDefault(), onsave([...picked]))}
>
  <h3>{t('GURPS.modifierSelectJournalsTitle')}</h3>
  <aside>{t('GURPS.modifierSelectJournalsAside')}</aside>
  <div class="section">
    <div id="entry-list" class="gurps-3col gurps-checkbox-col overflowy">
      <header>{t('GURPS.showQuestion')}</header>
      <header>{t('GURPS.name')}</header>
      <header>{t('GURPS.ID')}</header>
      {#each choices as choice (choice.id)}
        <div>
          <input
            type="checkbox"
            id={choice.id}
            checked={picked.has(choice.id)}
            onchange={event => toggle(choice.id, event.currentTarget.checked)}
          />
        </div>
        <div><label for={choice.id}>{choice.folder ? `${choice.folder}/` : ''}{choice.name}</label></div>
        <div>{choice.id}</div>
      {/each}
    </div>
  </div>
  <div class="section">
    <button id="update" type="submit"><i class="fa-solid fa-floppy-disk"></i>{t('GURPS.update')}</button>
  </div>
</form>
