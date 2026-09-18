/** A text journal page the modifier bucket may show, and where it sits in the folder tree. */
export interface JournalChoice {
  id: string
  name: string
  /** The folder path, `''` for a page at the top level. */
  folder: string
}

/** What `journalChoices` needs of a journal page. */
export interface JournalPageLike {
  id: string | null
  name: string
  type: string
  folder?: { id: string } | null
}

/** Enough of Foundry's folder collection to walk a page's ancestry. */
export interface FolderLookup {
  get(id: string): { name: string; parent?: { id: string } | null } | undefined
}

/**
 * The folder path a page sits under, outermost folder first.
 *
 * Two pages may share a name in different folders, so the path is what tells them apart in the list.
 */
export function folderPath(folders: FolderLookup, id: string | null | undefined): string {
  const segments: string[] = []

  let current = id ? folders.get(id) : undefined
  // A folder cannot contain itself, so the walk terminates at the first folder with no parent.
  while (current) {
    segments.unshift(current.name)
    current = current.parent ? folders.get(current.parent.id) : undefined
  }

  return segments.join('/')
}

/**
 * The pages the user may pick from, sorted the way they are shown.
 *
 * Only text pages can be rendered into the bucket, and a page the user cannot observe is left out
 * rather than listed and then refused.
 */
export function journalChoices(
  pages: Iterable<JournalPageLike>,
  folders: FolderLookup,
  canObserve: (page: JournalPageLike) => boolean
): JournalChoice[] {
  const choices: JournalChoice[] = []

  for (const page of pages) {
    if (page.type !== 'text' || !page.id || !canObserve(page)) continue
    choices.push({ id: page.id, name: page.name, folder: folderPath(folders, page.folder?.id) })
  }

  return choices.sort((a, b) => `${a.folder}/${a.name}`.localeCompare(`${b.folder}/${b.name}`))
}
