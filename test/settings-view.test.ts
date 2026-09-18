import { settingUpdates, settingsForModule } from '../module/utilities/settings-view.ts'

describe('settingUpdates', () => {
  it('splits the namespace off the setting id', () => {
    expect(settingUpdates({ 'gurps.combat.rangeStrategy': 'Basic' }, 'gurps')).toEqual([
      { id: 'combat.rangeStrategy', value: 'Basic' },
    ])
  })

  it('keeps the dots inside a setting id', () => {
    expect(settingUpdates({ 'gurps.pdf.open-first': true }, 'gurps')[0].id).toBe('pdf.open-first')
  })

  it("drops a field from somebody else's namespace rather than writing it under ours", () => {
    expect(settingUpdates({ 'dnd5e.something': 1, 'gurps.mine': 2 }, 'gurps')).toEqual([{ id: 'mine', value: 2 }])
  })

  it('drops a field with no setting id at all', () => {
    expect(settingUpdates({ gurps: 'nonsense' }, 'gurps')).toEqual([])
  })

  it('keeps a false or zero value, which is the whole point of a checkbox', () => {
    expect(settingUpdates({ 'gurps.a.b': false, 'gurps.c.d': 0 }, 'gurps')).toEqual([
      { id: 'a.b', value: false },
      { id: 'c.d', value: 0 },
    ])
  })
})

describe('settingsForModule', () => {
  const settings = [
    { id: 'gurps.combat.rangeStrategy' },
    { id: 'gurps.damage.useArmorDivisor' },
    { id: 'gurps.combat.useOnTarget' },
    { id: 'dnd5e.combat.something' },
  ]

  it('keeps one module, in registration order', () => {
    expect(settingsForModule(settings, 'combat')).toEqual([
      { id: 'gurps.combat.rangeStrategy' },
      { id: 'gurps.combat.useOnTarget' },
    ])
  })

  it("does not match another system's module of the same name", () => {
    expect(settingsForModule(settings, 'combat').map(s => s.id)).not.toContain('dnd5e.combat.something')
  })
})
