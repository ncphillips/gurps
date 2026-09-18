/** One setting the window renders: the Foundry `DataField` that knows how to draw it, and its value. */
export interface SettingEntry<Field = unknown> {
  field: Field
  value: unknown
}

/** A setting the window is about to write, split out of the `namespace.id` the form field carries. */
export interface SettingUpdate {
  id: string
  value: unknown
}

/**
 * Turns the submitted form into the settings to write.
 *
 * Every field is named `<namespace>.<settingId>`, and a setting id may itself contain dots, so only
 * the first segment is the namespace. Anything outside the system's namespace is dropped rather
 * than written: `game.settings.set` is called with the system's name, so a foreign key would be
 * created under it.
 */
export function settingUpdates(submitted: Record<string, unknown>, namespace: string): SettingUpdate[] {
  const updates: SettingUpdate[] = []

  for (const [key, value] of Object.entries(submitted)) {
    const [fieldNamespace, ...rest] = key.split('.')
    if (fieldNamespace !== namespace || rest.length === 0) continue

    updates.push({ id: rest.join('.'), value })
  }

  return updates
}

/** The settings belonging to one module, in the order they were registered. */
export function settingsForModule<T extends { id: string }>(settings: Iterable<T>, module: string): T[] {
  const prefix = `gurps.${module}.`

  return Array.from(settings).filter(setting => setting.id.startsWith(prefix))
}
