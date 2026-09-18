import type { Component } from 'svelte'
import { mount, unmount } from 'svelte'

/**
 * Bridges Svelte 5 into Foundry's ApplicationV2 lifecycle.
 *
 * Foundry keeps what it is good at -- the window frame, positioning, the header buttons -- and
 * Svelte owns everything inside `.window-content`. Where a Handlebars application re-renders the
 * whole part on every change and then re-binds its listeners, a subclass here mounts once and lets
 * the component's own reactivity handle updates.
 *
 * A subclass supplies the root component and its props:
 *
 * ```ts
 * class MyApp extends SvelteApplication {
 *   static override DEFAULT_OPTIONS = { id: 'my-app', window: { title: 'GURPS.myApp' } }
 *
 *   override component = () => MyComponent
 *   override props = () => ({ actor: this.actor })
 * }
 * ```
 */
export abstract class SvelteApplication extends foundry.applications.api.ApplicationV2 {
  #instance: Record<string, unknown> | null = null

  /**
   * The root component to mount.
   *
   * Subclasses return concrete components with their own prop types, and `any` is the only bridge
   * that lets this base class stay agnostic about them.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract component(): Component<any>

  /** The props handed to the root component at mount time. */
  abstract props(): Record<string, unknown>

  /** Svelte renders into the DOM directly, so there is no HTML string to hand back. */
  protected override _renderHTML(): Promise<string> {
    return Promise.resolve('')
  }

  protected override _replaceHTML(_result: string, content: HTMLElement): void {
    content.innerHTML = ''
  }

  protected override async _onRender(_context: object, _options: object): Promise<void> {
    // A forced re-render calls this again on the same element; drop the old tree before mounting a
    // new one so the two never share the target.
    this.#destroy()

    const target = this.element.querySelector<HTMLElement>('.window-content') ?? this.element
    this.#instance = mount(this.component(), { target, props: this.props() })
  }

  protected override async _onClose(options: object): Promise<void> {
    this.#destroy()
    await super._onClose(options)
  }

  /** Opens the application, or closes it if it is already open. */
  toggle(): void {
    if (this.rendered) void this.close()
    else void this.render({ force: true })
  }

  #destroy(): void {
    if (!this.#instance) return

    // `unmount` runs the components' cleanups, which is what takes their `Hooks.off` calls with them.
    void unmount(this.#instance)
    this.#instance = null
  }
}
