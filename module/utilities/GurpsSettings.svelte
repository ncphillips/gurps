<script lang="ts">
  import { t } from '../svelte/localize.ts'
  import type { SettingEntry } from './settings-view.ts'

  interface Props {
    /** The settings to show, each with the Foundry `DataField` that draws it. */
    entries: SettingEntry<{ toFormGroup(group: object, input: object): HTMLElement }>[]
    /** Hands the submitted form up; reading Foundry's typed values out of it is the caller's job. */
    onsave: (form: HTMLFormElement) => void
  }

  let { entries, onsave }: Props = $props()

  /**
   * Draws one setting.
   *
   * A setting can be any `DataField` -- a checkbox, a number with a range, a select over choices --
   * and the field itself knows how to build the widget, labels and hint. Rebuilding that in markup
   * would mean reimplementing Foundry's form widgets and then keeping up with them, so the element
   * it produces is adopted instead.
   */
  function formGroup(node: HTMLElement, entry: SettingEntry<{ toFormGroup(g: object, i: object): HTMLElement }>) {
    node.replaceChildren(entry.field.toFormGroup({ localize: true }, { value: entry.value }))

    return {
      update(next: typeof entry) {
        node.replaceChildren(next.field.toFormGroup({ localize: true }, { value: next.value }))
      },
    }
  }
</script>

<form class="gga-settings" onsubmit={event => (event.preventDefault(), onsave(event.currentTarget))}>
  <section class="settings-list scrollable">
    {#each entries as entry, index (index)}
      <div use:formGroup={entry}></div>
    {/each}
  </section>

  <footer class="form-footer">
    <button type="submit"><i class="fa-solid fa-floppy-disk" inert></i> {t('SETTINGS.Save')}</button>
  </footer>
</form>
