import { folderPath, journalChoices, type JournalPageLike } from '../module/modifier-bucket/journal-list.ts'

const folders = {
  rules: { name: 'Rules', parent: { id: 'campaign' } },
  campaign: { name: 'Campaign', parent: null },
}

const lookup = { get: (id: string) => (folders as Record<string, { name: string; parent: { id: string } | null }>)[id] }

function page(id: string, name: string, type = 'text', folder: string | null = null): JournalPageLike {
  return { id, name, type, folder: folder ? { id: folder } : null }
}

describe('folderPath', () => {
  it('names the folders from the outside in', () => {
    expect(folderPath(lookup, 'rules')).toBe('Campaign/Rules')
  })

  it('is empty for a page at the top level', () => {
    expect(folderPath(lookup, null)).toBe('')
  })

  it('is empty for a folder that no longer exists', () => {
    expect(folderPath(lookup, 'deleted')).toBe('')
  })
})

describe('journalChoices', () => {
  const observeEverything = () => true

  it('keeps only text pages', () => {
    const pages = [page('a', 'Notes'), page('b', 'A Map', 'image')]

    expect(journalChoices(pages, lookup, observeEverything).map(choice => choice.id)).toEqual(['a'])
  })

  it('leaves out a page the user may not observe', () => {
    const pages = [page('a', 'Secret'), page('b', 'Public')]

    const choices = journalChoices(pages, lookup, candidate => candidate.id !== 'a')

    expect(choices.map(choice => choice.id)).toEqual(['b'])
  })

  it('sorts by folder path, then name, so same-named pages are told apart', () => {
    const pages = [
      page('a', 'Modifiers', 'text', 'rules'),
      page('b', 'Modifiers'),
      page('c', 'Combat', 'text', 'rules'),
    ]

    expect(journalChoices(pages, lookup, observeEverything).map(choice => choice.id)).toEqual(['b', 'c', 'a'])
  })

  it('records the folder path alongside the name', () => {
    const [choice] = journalChoices([page('a', 'Modifiers', 'text', 'rules')], lookup, observeEverything)

    expect(choice).toEqual({ id: 'a', name: 'Modifiers', folder: 'Campaign/Rules' })
  })
})
