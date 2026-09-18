# Svelte in the Game Aid

The system's user interface is moving from Handlebars templates to Svelte 5 components, one
application at a time. Nothing is converted wholesale: a Handlebars application keeps working
untouched until somebody converts it, and the two run side by side.

## The build

`tsc` used to emit one file per source file. It could not have compiled a `.svelte` import, so the
build is Vite (`vite.config.ts`), bundling the entry `system.json` already names --
`module/gurps.js` -- into `dist/module/gurps.js`. The published layout is unchanged.

| script              | what it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `npm run build`     | stylesheets, static files, then the bundle                       |
| `npm run dev`       | the same, rebuilding on change                                   |
| `npm run typecheck` | `tsc --noEmit` for the TypeScript, `svelte-check` for components |
| `npm run test`      | the Jest suite                                                   |

`tsc` no longer emits anything; it is the type checker.

## Converting an application

Three files, and the pattern is the same each time -- `module/token/quick-roll-settings.ts` is the
smallest example, `module/actor/move-mode-editor.ts` the fullest.

1. **`*-view.ts` -- the data.** Whatever the old `getData` computed, plus whatever its listeners did
   to the data on the way back out: reading a setting, building the update that moves a flag,
   renumbering a list. Pure functions over plain objects, with no Foundry globals in reach, because
   this is the part the Jest suite tests.

2. **`*.svelte` -- the markup.** Named in PascalCase, beside the application class. It takes the
   data as props and hands events back as `on...` callbacks; it does not reach for `game`, the
   actor, or the application. Strings come from `t('GURPS.someKey')` -- the same keys the template
   used -- and the `style` attributes a template accumulated belong in `styles/apps.css`, scoped to
   the application's id or class.

3. **`*.ts` -- the application.** Extends `SvelteApplication` (an `ApplicationV2`) and supplies
   `component()` and `props()`. This is the only one of the three that touches Foundry: it reads the
   document, writes updates, and closes the window.

Then delete the `.hbs` template, and check `templates/` and `lib/moustachewax.js` for a Handlebars
helper that nothing else uses any more.

## What changes when you convert

- **No re-render by hand.** A Handlebars application calls `this.render(true)` at the end of every
  handler to get the markup back in step with the data. A component's state is already the markup,
  so those calls go. Where the window shows a document, subscribe to `updateActor` (or the matching
  hook) in `_onRender` and drop the subscription in `_onClose` -- the window then also follows an
  edit made somewhere else, which the re-render-by-hand version never did.
- **No `data-action` dispatch.** One delegated listener switching on a string attribute becomes a
  handler per control, typed by its props.
- **No DOM editing.** A row that shows or hides becomes an `{#if}`.

## Rules

- Runes only: `$state`, `$derived`, `$props`, `$effect`. A `$effect` that subscribes to a Foundry
  hook returns a cleanup that calls `Hooks.off`.
- `Set` and `Map` in component state come from `svelte/reactivity`; a plain one is not reactive.
- Every user-facing string goes through `t()`. No string literals in the markup.
- Components stay presentational. If a component needs to know a GURPS rule, that rule belongs in
  its `*-view.ts`, where it can be tested.
