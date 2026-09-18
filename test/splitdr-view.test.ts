import { NEW_SPLIT, damageTypeOptions, readSplit } from '../module/actor/splitdr-view.ts'

describe('readSplit', () => {
  it('reads the single entry the actor stores', () => {
    expect(readSplit({ cut: 4 })).toEqual({ type: 'cut', value: 4 })
  })

  it('reports no split at all', () => {
    expect(readSplit(undefined)).toBeNull()
    expect(readSplit({})).toBeNull()
  })

  it('reads a value that was stored as a string', () => {
    expect(readSplit({ cut: '4' as unknown as number })).toEqual({ type: 'cut', value: 4 })
  })
})

describe('damageTypeOptions', () => {
  const known = ['burn', 'cor', 'cr', 'cut']

  it('offers the known types', () => {
    expect(damageTypeOptions(known, 'cut')).toEqual(known)
  })

  it('adds a type outside the table, so the select can show the location its own', () => {
    expect(damageTypeOptions(known, 'pi-')).toEqual([...known, 'pi-'])
  })
})

describe('NEW_SPLIT', () => {
  it('starts at no damage type and no DR', () => {
    expect(NEW_SPLIT).toEqual({ type: 'none', value: 0 })
  })
})
