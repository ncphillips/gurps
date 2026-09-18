/**
 * `tsc` cannot parse a `.svelte` file, so `npm run typecheck` would fail on every component import.
 * This keeps it going; `svelte-check`, which runs in the same script, is what actually type-checks
 * the components and their props -- it resolves each component to its real generated type, which
 * takes precedence over this wildcard.
 */
declare module '*.svelte' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: import('svelte').Component<any>
  export default component
}
