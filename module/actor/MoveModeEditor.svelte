<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity'
  import { t } from '../svelte/localize.ts'
  import {
    canChooseDefault,
    canDeleteMode,
    isDefaultMode,
    isKnownMode,
    moveModeOptions,
    type MoveModes,
  } from './move-mode-view.ts'

  interface Props {
    /** The actor's move list, as `actor.system.move` holds it. */
    modes: MoveModes
    onadd: () => void
    ondelete: (key: string) => void
    onchoosedefault: (key: string) => void
    onedit: (key: string, field: 'mode' | 'basic' | 'enhanced', value: string) => void
  }

  let { modes, onadd, ondelete, onchoosedefault, onedit }: Props = $props()

  const OTHER = 'other'

  /** Rows whose custom-mode field is open, either because it was just picked or is already in use. */
  const editingCustom = new SvelteSet<string>()

  function onModeSelected(key: string, value: string): void {
    // `<other>` is not a mode, it is the request to type one, so the actor is left alone until the
    // text field below says what the mode actually is.
    if (value === OTHER) {
      editingCustom.add(key)
      return
    }

    editingCustom.delete(key)
    onedit(key, 'mode', value)
  }
</script>

<form class="sheet" autocomplete="off">
  <div class="move-mode-editor table">
    <div class="label">{t('GURPS.moveModeType')}</div>
    <div class="label">{t('GURPS.basic')}</div>
    <div class="label">{t('GURPS.enhanced')}</div>
    <div class="label">{t('GURPS.default')}</div>
    <button id="template-add" type="button" class="button icon" title={t('GURPS.add')} onclick={onadd}>
      <i class="fa-solid fa-plus"></i>
    </button>

    {#each Object.entries(modes) as [key, mode] (key)}
      <div class="mode-column">
        <select value={mode.mode} onchange={event => onModeSelected(key, event.currentTarget.value)}>
          {#each moveModeOptions(mode.mode) as option (option)}
            <option value={option}>{t(option)}</option>
          {/each}
          <option value={OTHER}>&lt;{t('GURPS.moveModeOther')}&gt;</option>
        </select>
        {#if editingCustom.has(key) || !isKnownMode(mode.mode)}
          <!-- svelte-ignore a11y_autofocus -- picking `<other>` is a request to type, so the caret goes there. -->
          <input
            class="expand-contract"
            type="text"
            autofocus
            value={t(mode.mode)}
            aria-label={t('GURPS.moveModeOther')}
            onchange={event => onedit(key, 'mode', event.currentTarget.value)}
            onkeyup={event => event.key === 'Escape' && editingCustom.delete(key)}
          />
        {/if}
      </div>
      <input
        type="number"
        class="centered"
        aria-label={t('GURPS.basic')}
        value={mode.basic}
        onchange={event => onedit(key, 'basic', event.currentTarget.value)}
      />
      <input
        type="number"
        class="centered"
        aria-label={t('GURPS.enhanced')}
        value={mode.enhanced ?? ''}
        onchange={event => onedit(key, 'enhanced', event.currentTarget.value)}
      />
      <!-- Unchecking the default would leave the actor with no move, so only the others are live. -->
      <input
        type="checkbox"
        aria-label={t('GURPS.default')}
        checked={isDefaultMode(mode)}
        disabled={!canChooseDefault(modes) || isDefaultMode(mode)}
        onchange={() => onchoosedefault(key)}
      />
      {#if canDeleteMode(modes, key)}
        <button type="button" class="delete-mode" title={t('GURPS.delete')} onclick={() => ondelete(key)}>
          <i class="fa-solid fa-trash"></i>
        </button>
      {:else}
        <div></div>
      {/if}
    {/each}
  </div>
</form>
