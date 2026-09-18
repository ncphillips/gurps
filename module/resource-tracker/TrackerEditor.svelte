<script lang="ts">
  import { t } from '../svelte/localize.ts'
  import type { TrackerInstance } from './types.ts'
  import { COMPARISONS, OPERATORS, emptyTracker, isValidAlias, newThreshold } from './tracker-editor-view.ts'

  interface Props {
    /** The tracker being edited. */
    tracker: TrackerInstance
    /** Called after every edit, so the application always holds the current state. */
    onchange: (tracker: TrackerInstance) => void
    /** Saves and closes. */
    onupdate: () => void
    /** An alias a formula could not carry; the application is what tells the player. */
    oninvalidalias: (alias: string) => void
  }

  let { tracker, onchange, onupdate, oninvalidalias }: Props = $props()

  // svelte-ignore state_referenced_locally -- the tracker is read once, at mount.
  let draft = $state(tracker)

  // Every edit is published, because the application hands the tracker to whoever opened the
  // editor and the old version wrote each change straight through as it happened.
  $effect(() => {
    onchange($state.snapshot(draft) as TrackerInstance)
  })

  function onAliasChanged(event: Event & { currentTarget: HTMLInputElement }): void {
    const alias = event.currentTarget.value
    if (isValidAlias(alias)) {
      draft.alias = alias
      return
    }

    oninvalidalias(alias)
    event.currentTarget.value = draft.alias
  }
</script>

<div class="resource-editor">
  <div class="editor-body">
    <div>
      <div class="name">
        <input class="name gcs-input" type="text" bind:value={draft.name} placeholder={t('GURPS.resourceName')} />
      </div>
      <div class="grid grid-2col">
        <div class="inputs">
          <input class="minimum gcs-input" type="number" bind:value={draft.min} aria-label={t('GURPS.minimum')} />
          <div class="label">{t('GURPS.minimum')}</div>
          <input class="maximum gcs-input" type="number" bind:value={draft.max} aria-label={t('GURPS.maximum')} />
          <div class="label">{t('GURPS.maximum')}</div>
          <input class="current gcs-input" type="number" bind:value={draft.value} aria-label={t('GURPS.current')} />
          <div class="label">{t('GURPS.current')}</div>
          <input
            class="alias gcs-input"
            type="text"
            value={draft.alias}
            aria-label={t('GURPS.resourceTemplateAlias')}
            onchange={onAliasChanged}
          />
          <div class="label">{t('GURPS.resourceTemplateAlias')}</div>
        </div>

        <div class="inputs">
          <label class="label checkbox-row">
            <input type="checkbox" bind:checked={draft.isMinimumEnforced} />
            {t('GURPS.resourceEnforceMinimum')}
          </label>
          <label class="label checkbox-row">
            <input type="checkbox" bind:checked={draft.isMaximumEnforced} />
            {t('GURPS.resourceEnforceMaximum')}
          </label>
          <label class="label checkbox-row">
            <input type="checkbox" bind:checked={draft.isDamageType} />
            {t('GURPS.resourceDamageType')}
          </label>
          <input class="pdf-ref gcs-input" type="text" bind:value={draft.pdf} aria-label={t('GURPS.reference')} />
          <div class="label">{t('GURPS.reference')}</div>
        </div>
      </div>

      <label class="label checkbox-row">
        <input type="checkbox" bind:checked={draft.isDamageTracker} />
        {t('GURPS.resourceDamageTracker')}
      </label>
      <label class="label checkbox-row spaced">
        <input type="checkbox" bind:checked={draft.breakpoints} />
        {t('GURPS.useBreakpoints')}
      </label>
    </div>

    <div><hr /></div>
    <div class="section">
      <h3>{t('GURPS.thresholds')}</h3>
      <div></div>
    </div>

    <div class="threshold-scroll">
      <div class="threshold table">
        {#if draft.thresholds.length > 0}
          <div class="label span3">{t('GURPS.resourceCurrentValue')}</div>
          <div class="label">{t('GURPS.condition')}</div>
          <div class="label">{t('GURPS.color')}</div>
        {:else}
          <div class="span3"></div>
          <div></div>
          <div></div>
        {/if}
        <div>
          <button
            id="threshold-add"
            type="button"
            class="button icon"
            title={t('GURPS.add')}
            onclick={() => draft.thresholds.push(newThreshold(t('GURPS.normal')))}
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        {#each draft.thresholds as threshold, index (index)}
          <div>
            <select class="comparison" bind:value={threshold.comparison} aria-label={t('GURPS.resourceCurrentValue')}>
              {#each COMPARISONS as comparison (comparison)}
                <option value={comparison}>{comparison}</option>
              {/each}
            </select>
          </div>
          <div>
            <select bind:value={threshold.operator} aria-label={t('GURPS.max')}>
              {#each OPERATORS as operator (operator)}
                <option value={operator}>{t('GURPS.max')} {operator}</option>
              {/each}
            </select>
          </div>
          <input class="gcs-input" type="number" step="any" bind:value={threshold.value} aria-label={t('GURPS.max')} />
          <input class="gcs-input" type="text" bind:value={threshold.condition} aria-label={t('GURPS.condition')} />
          <div class="vertical-center">
            <input type="color" bind:value={threshold.color} aria-label={t('GURPS.color')} />
          </div>
          <div class="vertical-center">
            <button
              type="button"
              class="button icon"
              title={t('GURPS.delete')}
              onclick={() => draft.thresholds.splice(index, 1)}
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        {/each}
      </div>
    </div>

    <div class="editor-footer">
      <button type="button" id="reset" onclick={() => (draft = emptyTracker())}>
        <i class="fa-solid fa-ban"></i>{t('GURPS.reset')}
      </button>
      <button type="button" id="update" onclick={onupdate}>
        <i class="fa-solid fa-save"></i>{t('GURPS.update')}
      </button>
    </div>
  </div>
</div>
