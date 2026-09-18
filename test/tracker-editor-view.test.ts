import {
  COMPARISONS,
  OPERATORS,
  emptyTracker,
  isValidAlias,
  newThreshold,
} from '../module/resource-tracker/tracker-editor-view.ts'

describe('isValidAlias', () => {
  it('accepts letters, digits and underscores', () => {
    expect(isValidAlias('fatigue_2')).toBe(true)
  })

  it('accepts the damage abbreviations that carry plus and minus', () => {
    for (const alias of ['pi-', 'pi+', 'pi++']) expect(isValidAlias(alias)).toBe(true)
  })

  it('rejects anything a formula could not carry', () => {
    for (const alias of ['has space', 'brackets[]', '', 'quote"']) expect(isValidAlias(alias)).toBe(false)
  })
})

describe('emptyTracker', () => {
  it('is blank, with breakpoints on', () => {
    expect(emptyTracker()).toEqual({
      name: '',
      alias: '',
      pdf: '',
      max: 0,
      min: 0,
      value: 0,
      isDamageTracker: false,
      isDamageType: false,
      breakpoints: true,
      thresholds: [],
    })
  })

  it('is a fresh object each time, so a reset cannot share the previous one', () => {
    const first = emptyTracker()
    first.thresholds.push(newThreshold('Normal'))

    expect(emptyTracker().thresholds).toHaveLength(0)
  })
})

describe('newThreshold', () => {
  it('starts at the maximum, so it is not already crossed', () => {
    expect(newThreshold('Normal')).toEqual({
      comparison: '>',
      operator: '×',
      value: 1,
      condition: 'Normal',
      color: '#FFFFFF',
    })
  })

  it('offers its comparison and operator among the choices', () => {
    const threshold = newThreshold('Normal')

    expect(COMPARISONS).toContain(threshold.comparison)
    expect(OPERATORS).toContain(threshold.operator)
  })
})
