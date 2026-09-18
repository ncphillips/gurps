<script lang="ts">
  import { t } from '../module/svelte/localize.ts'

  interface Props {
    /** Loads the changelog, already trimmed and rendered to HTML. */
    load: () => Promise<string>
  }

  let { load }: Props = $props()

  // The file is fetched from the server, so the window opens on a placeholder rather than waiting.
  // svelte-ignore state_referenced_locally -- one window, one fetch, at mount.
  const changelog = load()
</script>

<div class="content">
  {#await changelog}
    <p>{t('GURPS.changelog.loading')}</p>
  {:then html}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- markdown-it's output is the whole point. -->
    {@html html}
  {:catch}
    <p>{t('GURPS.changelog.unavailable')}</p>
  {/await}
</div>
