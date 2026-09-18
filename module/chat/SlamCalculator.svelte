<script lang="ts">
  import { t } from '../svelte/localize.ts'
  import {
    initialSlamState,
    relativeSpeed,
    sanitizeThrust,
    type SlamFormState,
    type SlamToken,
  } from './slam-calculator-view.ts'

  interface Props {
    attacker: SlamToken | null
    target: SlamToken | null
    /** Rolls the slam out to chat. */
    onresolve: (state: SlamFormState) => void
  }

  let { attacker, target, onresolve }: Props = $props()

  // svelte-ignore state_referenced_locally -- the tokens are read once, at mount.
  let form = $state(initialSlamState(attacker, target))

  let speed = $derived(relativeSpeed(form))

  const attackerName = $derived(attacker?.name ?? t('GURPS.attacker'))
  const targetName = $derived(target?.name ?? t('GURPS.target'))
</script>

<form class="gga-app" autocomplete="off" onsubmit={event => (event.preventDefault(), onresolve($state.snapshot(form)))}>
  <h2>
    {attackerName}
    <i>
      {t('GURPS.slams')}
      <i class="subtle fa-solid fa-align-right"></i><i class="fa-solid fa-person-running"></i>
    </i>
    {targetName}
  </h2>

  <div class="slam-rules">
    <label for="dfrpgrules">{t('GURPS.slamDFRPGRules')}:</label>
    <input id="dfrpgrules" type="checkbox" bind:checked={form.useDFRPGRules} />
  </div>

  <div class="gga-group inputs slam-side">
    <h4>{attackerName}</h4>
    <div class="label-value-row">
      <!--
        DFRPG slams roll thrust damage; the Basic Set rules derive the damage from HP and velocity.
        Only the field the chosen rules read is shown, so nobody edits a number that is ignored.
      -->
      {#if form.useDFRPGRules}
        <label for="attacker-thr">{t('GURPS.thrust')}:</label>
        <div>
          <input
            id="attacker-thr"
            type="text"
            bind:value={form.attackerThr}
            onchange={() => (form.attackerThr = sanitizeThrust(form.attackerThr))}
          />
        </div>
      {:else}
        <label for="attacker-hp">{t('GURPS.HP')}:</label>
        <div><input id="attacker-hp" type="number" bind:value={form.attackerHp} /></div>
      {/if}
      <label for="attacker-speed">{t('GURPS.slamVelocity')}:</label>
      <div><input id="attacker-speed" type="number" bind:value={form.attackerSpeed} /></div>
      <label for="aoa">{t('GURPS.slamAOAStrong')}:</label>
      <div><input id="aoa" type="checkbox" bind:checked={form.isAoAStrong} /></div>
      <label for="db">{t('GURPS.slamShieldDB')}:</label>
      <div><input id="db" type="number" bind:value={form.shieldDB} /></div>
    </div>
  </div>

  <div class="gga-group inputs slam-side">
    <h4>{targetName}</h4>
    <div class="label-value-row">
      {#if form.useDFRPGRules}
        <label for="target-thr">{t('GURPS.thrust')}:</label>
        <div>
          <input
            id="target-thr"
            type="text"
            bind:value={form.targetThr}
            onchange={() => (form.targetThr = sanitizeThrust(form.targetThr))}
          />
        </div>
      {:else}
        <label for="target-hp">{t('GURPS.HP')}:</label>
        <div><input id="target-hp" type="number" bind:value={form.targetHp} /></div>
      {/if}
      <label for="target-speed">{t('GURPS.slamVelocity')}:</label>
      <div><input id="target-speed" type="number" bind:value={form.targetSpeed} /></div>
    </div>
  </div>

  <div class="gga-group inputs slam-total">
    <div class="label-value-row">
      <label for="relative-speed"><strong>{t('GURPS.slamRelativeVelocity')}:</strong></label>
      <input id="relative-speed" type="text" value={speed} readonly disabled />
    </div>
  </div>

  <div class="button-bar">
    <button type="submit"><i class="fa-solid fa-check"></i> {t('GURPS.resolve')}</button>
  </div>
</form>
