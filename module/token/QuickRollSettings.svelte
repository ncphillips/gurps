<script lang="ts">
  import { t } from '../svelte/localize.ts'
  import {
    QUICK_ROLL_CATEGORY_TOGGLES,
    QUICK_ROLL_ENABLE_TOGGLE,
    type QuickRollSettingsData,
  } from './quick-roll-settings-view.ts'

  interface Props {
    /** The stored setting, already filled out by `readQuickRollSettings`. */
    settings: QuickRollSettingsData
    /** Persists the edited settings and closes the editor. */
    onsave: (settings: QuickRollSettingsData) => void
  }

  let { settings, onsave }: Props = $props()

  // The editor edits a copy: closing the window without saving has to leave the world setting alone.
  // svelte-ignore state_referenced_locally -- the snapshot at mount is the point.
  let draft = $state({ ...settings })

  // The categories only mean anything while quick rolls are on, so they follow the master switch
  // rather than silently accepting edits that do nothing.
  let categoriesDisabled = $derived(!draft.enabled)
</script>

<form class="quick-roll-settings" onsubmit={event => (event.preventDefault(), onsave({ ...draft }))}>
  <div class="hint">{t('GURPS.settingHintUseQuickRolls')}</div>
  <hr />
  <div class="form-group">
    <label for="quick-roll-{QUICK_ROLL_ENABLE_TOGGLE.key}">{t(QUICK_ROLL_ENABLE_TOGGLE.label)}</label>
    <input id="quick-roll-{QUICK_ROLL_ENABLE_TOGGLE.key}" type="checkbox" bind:checked={draft.enabled} />
  </div>
  <hr />
  {#each QUICK_ROLL_CATEGORY_TOGGLES as toggle (toggle.key)}
    <div class="form-group">
      <label for="quick-roll-{toggle.key}">{t(toggle.label)}</label>
      <input
        id="quick-roll-{toggle.key}"
        type="checkbox"
        disabled={categoriesDisabled}
        bind:checked={draft[toggle.key]}
      />
    </div>
  {/each}
  <button type="submit">
    <i class="fa-solid fa-save"></i><span>{t('GURPS.update')}</span>
  </button>
</form>
