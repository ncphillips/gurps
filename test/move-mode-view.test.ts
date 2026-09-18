import {
  canChooseDefault,
  canDeleteMode,
  defaultModeUpdate,
  isDefaultMode,
  isKnownMode,
  moveModeOptions,
  withAddedMode,
  withoutMode,
  type MoveModes,
} from '../module/actor/move-mode-view.ts'
import { MoveModes as KnownModes } from '../module/actor/move-modes.ts'

function modes(...entries: Array<{ mode: string; basic?: number; default?: boolean | string }>): MoveModes {
  return Object.fromEntries(
    entries.map((entry, index) => [
      String(index).padStart(5, '0'),
      { mode: entry.mode, basic: entry.basic ?? 0, enhanced: undefined, default: entry.default ?? false },
    ])
  )
}

describe('moveModeOptions', () => {
  it('offers the four known modes', () => {
    expect(moveModeOptions(KnownModes.Ground)).toEqual([
      KnownModes.Ground,
      KnownModes.Air,
      KnownModes.Water,
      KnownModes.Space,
    ])
  })

  it('adds a mode a player typed, so the select can show the row its own value', () => {
    expect(moveModeOptions('Burrowing')).toContain('Burrowing')
  })

  it('does not duplicate a known mode', () => {
    expect(moveModeOptions(KnownModes.Air)).toHaveLength(4)
  })
})

describe('isKnownMode', () => {
  it('recognises a system mode', () => {
    expect(isKnownMode(KnownModes.Water)).toBe(true)
  })

  it('rejects text a player typed', () => {
    expect(isKnownMode('Burrowing')).toBe(false)
  })
})

describe('isDefaultMode', () => {
  it('reads the boolean', () => {
    expect(isDefaultMode({ mode: KnownModes.Ground, basic: 5, default: true })).toBe(true)
  })

  it('reads the string an older import wrote', () => {
    expect(isDefaultMode({ mode: KnownModes.Ground, basic: 5, default: 'true' })).toBe(true)
  })

  it('treats a missing row as not default', () => {
    expect(isDefaultMode(undefined)).toBe(false)
  })
})

describe('withAddedMode', () => {
  it('appends a row at the next free key', () => {
    const next = withAddedMode(modes({ mode: KnownModes.Ground, default: true }))

    expect(Object.keys(next)).toEqual(['00000', '00001'])
    expect(next['00001']).toMatchObject({ mode: 'other', basic: 0, default: false })
  })

  it('makes the first row an actor gets its default', () => {
    expect(withAddedMode({})['00000']).toMatchObject({ default: true })
  })

  it('leaves the original untouched', () => {
    const before = modes({ mode: KnownModes.Ground, default: true })
    withAddedMode(before)

    expect(Object.keys(before)).toEqual(['00000'])
  })
})

describe('withoutMode', () => {
  it('renumbers the survivors rather than leaving a hole', () => {
    const before = modes(
      { mode: KnownModes.Ground, default: true },
      { mode: KnownModes.Air, basic: 12 },
      { mode: KnownModes.Water, basic: 3 }
    )

    const after = withoutMode(before, '00001')

    expect(Object.keys(after)).toEqual(['00000', '00001'])
    expect(after['00001']).toMatchObject({ mode: KnownModes.Water, basic: 3 })
  })
})

describe('canDeleteMode', () => {
  it('refuses the default, which is where the actor gets its move', () => {
    const list = modes({ mode: KnownModes.Ground, default: true }, { mode: KnownModes.Air })

    expect(canDeleteMode(list, '00000')).toBe(false)
    expect(canDeleteMode(list, '00001')).toBe(true)
  })
})

describe('canChooseDefault', () => {
  it('needs something to choose between', () => {
    expect(canChooseDefault(modes({ mode: KnownModes.Ground, default: true }))).toBe(false)
    expect(canChooseDefault(modes({ mode: KnownModes.Ground, default: true }, { mode: KnownModes.Air }))).toBe(true)
  })
})

describe('defaultModeUpdate', () => {
  it('names every row, so exactly one carries the flag', () => {
    const list = modes({ mode: KnownModes.Ground, default: true }, { mode: KnownModes.Air }, { mode: KnownModes.Water })

    expect(defaultModeUpdate(list, '00002')).toEqual({
      'system.move.00000.default': false,
      'system.move.00001.default': false,
      'system.move.00002.default': true,
    })
  })
})
