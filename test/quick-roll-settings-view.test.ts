import {
  QUICK_ROLL_CATEGORY_TOGGLES,
  QUICK_ROLL_DEFAULTS,
  QUICK_ROLL_ENABLE_TOGGLE,
  readQuickRollSettings,
} from '../module/token/quick-roll-settings-view.ts'

describe('readQuickRollSettings', () => {
  it('returns the defaults when the setting has never been written', () => {
    expect(readQuickRollSettings(undefined)).toEqual(QUICK_ROLL_DEFAULTS)
  })

  it('keeps the stored values', () => {
    const stored = { ...QUICK_ROLL_DEFAULTS, enabled: false, attackChecks: false }

    expect(readQuickRollSettings(stored)).toEqual(stored)
  })

  it('fills in keys a world written by an older version is missing', () => {
    const stored = { enabled: false }

    expect(readQuickRollSettings(stored)).toEqual({ ...QUICK_ROLL_DEFAULTS, enabled: false })
  })

  it('ignores a value that is not a boolean', () => {
    expect(readQuickRollSettings({ enabled: 'yes' }).enabled).toBe(true)
  })

  it('survives a setting that is not an object at all', () => {
    expect(readQuickRollSettings('nonsense')).toEqual(QUICK_ROLL_DEFAULTS)
  })
})

describe('the toggles the editor shows', () => {
  it('covers every key of the setting exactly once', () => {
    const shown = [QUICK_ROLL_ENABLE_TOGGLE, ...QUICK_ROLL_CATEGORY_TOGGLES].map(toggle => toggle.key)

    expect(shown.sort()).toEqual(Object.keys(QUICK_ROLL_DEFAULTS).sort())
  })

  it('names catalogue keys, not literal text', () => {
    for (const toggle of [QUICK_ROLL_ENABLE_TOGGLE, ...QUICK_ROLL_CATEGORY_TOGGLES]) {
      expect(toggle.label).toMatch(/^GURPS\./)
    }
  })
})
