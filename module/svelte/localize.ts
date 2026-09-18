/**
 * Localization for Svelte components.
 *
 * Handlebars templates reach the catalogue through the `{{localize}}` helper; components call this
 * instead. Keys are spelled exactly as `lang/en.json` spells them, `GURPS.` prefix included, so a
 * string moving between a template and a component keeps its key.
 *
 * `game.i18n` is missing before Foundry's `i18nInit`, and in unit tests. Echoing the key back is
 * what a component rendered that early shows, which is the same thing Foundry does for a key with
 * no translation.
 */
export function t(key: string, interpolations?: Record<string, string | number>): string {
  if (!game.i18n) return key
  if (!interpolations) return game.i18n.localize(key)

  // `format` is typed for string values only, so numbers -- which templates pass freely -- are
  // stringified here rather than cast past the signature.
  const values = Object.fromEntries(Object.entries(interpolations).map(([name, value]) => [name, String(value)]))
  return game.i18n.format(key, values)
}
