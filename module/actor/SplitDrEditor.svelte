<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity'
  import { t } from '../svelte/localize.ts'
  import { damageTypeOptions, type SplitDr } from './splitdr-view.ts'

  interface Props {
    /** The location's split, or `null` while it has none. */
    split: SplitDr | null
    /** The damage type abbreviations the system knows. */
    damageTypes: string[]
    oncreate: () => void
    ondelete: () => void
    onchangetype: (type: string) => void
    onchangevalue: (value: number) => void
  }

  let { split, damageTypes, oncreate, ondelete, onchangetype, onchangevalue }: Props = $props()

  const OTHER = 'other'

  /** Open when `<other>` was picked, so the custom type can be typed in. */
  const editingCustom = new SvelteSet<string>()

  function onTypeSelected(value: string): void {
    // `<other>` is the request to type a type, not a type, so the actor waits for the text field.
    if (value === OTHER) {
      editingCustom.add(OTHER)
      return
    }

    editingCustom.delete(OTHER)
    onchangetype(value)
  }
</script>

<form class="sheet" autocomplete="off">
  <div class="splitdr-editor table">
    <div class="label">{t('GURPS.addDamageType')}</div>
    <div class="label">{t('GURPS.splitDrValue')}</div>
    {#if split}
      <div></div>
    {:else}
      <button id="template-add" type="button" class="button icon" title={t('GURPS.add')} onclick={oncreate}>
        <i class="fa-solid fa-plus"></i>
      </button>
    {/if}

    {#if split}
      <div class="type-column">
        <select value={split.type} onchange={event => onTypeSelected(event.currentTarget.value)}>
          {#each damageTypeOptions(damageTypes, split.type) as option (option)}
            <option value={option}>{t(`GURPS.damageAbbrev${option}`)}</option>
          {/each}
          <option value={OTHER}>&lt;{t('GURPS.moveModeOther')}&gt;</option>
        </select>
        {#if editingCustom.has(OTHER)}
          <!-- svelte-ignore a11y_autofocus -- picking `<other>` is a request to type, so the caret goes there. -->
          <input
            class="expand-contract"
            type="text"
            autofocus
            value={split.type}
            aria-label={t('GURPS.addDamageType')}
            onchange={event => onchangetype(event.currentTarget.value)}
            onkeyup={event => event.key === 'Escape' && editingCustom.delete(OTHER)}
          />
        {/if}
      </div>
      <input
        type="number"
        class="centered"
        aria-label={t('GURPS.splitDrValue')}
        value={split.value}
        onchange={event => onchangevalue(Number(event.currentTarget.value))}
      />
      <button type="button" class="delete-split" title={t('GURPS.delete')} onclick={ondelete}>
        <i class="fa-solid fa-trash"></i>
      </button>
    {/if}
  </div>
</form>
