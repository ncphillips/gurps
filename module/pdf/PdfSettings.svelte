<script lang="ts">
  import { t } from '../svelte/localize.ts'

  interface Props {
    /** Which edition of the Basic Set the world's PDFs are. */
    basicSet: string
    /** Whether a page reference with several PDFs behind it opens the first rather than asking. */
    openFirst: boolean
    onsave: (settings: { basicSet: string; openFirst: boolean }) => void
  }

  let { basicSet, openFirst, onsave }: Props = $props()

  const EDITIONS = [
    { value: 'Combined', label: 'GURPS.settingBasicPDFsCombined' },
    { value: 'Separate', label: 'GURPS.settingBasicPDFsSeparate' },
    { value: 'Revised', label: 'GURPS.settingBasicPDFsRevised' },
  ]

  // svelte-ignore state_referenced_locally -- the settings are read once, at mount.
  let draft = $state({ basicSet, openFirst })
</script>

<form class="standard-form" onsubmit={event => (event.preventDefault(), onsave($state.snapshot(draft)))}>
  <section class="settings-header">
    <div class="form-group" data-setting-id="gurps.pdf.basicset">
      <div class="form-fields">
        <label for="gurps.pdf.basicset">
          {t('GURPS.settingBasicPDFs')}
          <select id="gurps.pdf.basicset" bind:value={draft.basicSet}>
            {#each EDITIONS as edition (edition.value)}
              <option value={edition.value}>{t(edition.label)}</option>
            {/each}
          </select>
        </label>
        <p class="notes">{t('GURPS.settingHintBasicPDFs')}</p>
      </div>
    </div>

    <div class="form-group" data-setting-id="gurps.pdf.open-first">
      <div class="form-fields">
        <label for="gurps.pdf.open-first">
          {t('GURPS.settingPDFOpenFirst')}
          <input id="gurps.pdf.open-first" type="checkbox" bind:checked={draft.openFirst} />
        </label>
        <p class="notes">{t('GURPS.settingHintPDFOpenFirst')}</p>
      </div>
    </div>
  </section>

  <footer class="form-footer">
    <button type="submit"><i class="fa-solid fa-save"></i><span>{t('SETTINGS.Save')}</span></button>
  </footer>
</form>
