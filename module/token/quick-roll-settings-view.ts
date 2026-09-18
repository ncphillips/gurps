/**
 * The shape of the `use-quick-rolls` setting, and the rows its editor shows.
 *
 * Kept apart from the component so the catalogue keys and the defaults can be unit tested without a
 * DOM: the component is presentational and renders whatever this describes.
 */
export interface QuickRollSettingsData {
  enabled: boolean
  attributeChecks: boolean
  otherChecks: boolean
  attackChecks: boolean
  defenseChecks: boolean
  markedChecks: boolean
}

export interface QuickRollToggle {
  key: keyof QuickRollSettingsData
  label: string
}

export const QUICK_ROLL_DEFAULTS: QuickRollSettingsData = {
  enabled: true,
  attributeChecks: true,
  otherChecks: true,
  attackChecks: true,
  defenseChecks: true,
  markedChecks: true,
}

/** The master switch, shown above the rule that separates it from what it governs. */
export const QUICK_ROLL_ENABLE_TOGGLE: QuickRollToggle = { key: 'enabled', label: 'GURPS.quickRollUse' }

/** The individual roll categories the quick roll menu may offer. */
export const QUICK_ROLL_CATEGORY_TOGGLES: QuickRollToggle[] = [
  { key: 'attributeChecks', label: 'GURPS.quickRollShowAttributes' },
  { key: 'otherChecks', label: 'GURPS.quickRollShowOther' },
  { key: 'attackChecks', label: 'GURPS.quickRollShowAttacks' },
  { key: 'defenseChecks', label: 'GURPS.quickRollShowDefenses' },
  { key: 'markedChecks', label: 'GURPS.quickRollShowMarked' },
]

/**
 * Fills in whatever the stored setting is missing.
 *
 * The setting is a free-form object, and worlds carry values written by older versions of the
 * system, so a key added since then arrives as `undefined` and would otherwise bind a checkbox to
 * nothing.
 */
export function readQuickRollSettings(stored: unknown): QuickRollSettingsData {
  const source = typeof stored === 'object' && stored !== null ? (stored as Partial<QuickRollSettingsData>) : {}

  return Object.fromEntries(
    Object.entries(QUICK_ROLL_DEFAULTS).map(([key, fallback]) => [
      key,
      typeof source[key as keyof QuickRollSettingsData] === 'boolean'
        ? source[key as keyof QuickRollSettingsData]
        : fallback,
    ])
  ) as unknown as QuickRollSettingsData
}
