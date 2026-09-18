import { SemanticVersion } from './semver.js'

/** How many releases the window shows at most, however far behind the world is. */
const MAX_ENTRIES = 5

const VERSION_HEADING = /([0-9]+\.[0-9]+\.[0-9]+)/

/** A link in the changelog points at the release on GitHub, which is no use inside the window. */
const HTML_LINK = /<a href=.*<\/a>/g

/**
 * Cuts the changelog down to what the player has not seen.
 *
 * Lines are scanned for a version heading, and everything from the first heading that is not newer
 * than `lastVersion` -- or the sixth heading, whichever comes first -- is dropped.
 *
 * A world with no recorded version gets the whole file: that is a world seeing the system for the
 * first time, and there is no entry it has already read.
 */
export function trimChangelog(markdown: string, lastVersion: SemanticVersion | null): string {
  const lines = markdown.replace(HTML_LINK, '').split(/[\n\r]/)
  if (!lastVersion) return lines.join('\n')

  let entries = 0
  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(VERSION_HEADING)
    const version = heading ? SemanticVersion.fromString(heading[1]) : null
    if (!version) continue

    entries++
    if (entries > MAX_ENTRIES || !version.isHigherThan(lastVersion)) {
      return lines.slice(0, index).join('\n')
    }
  }

  return lines.join('\n')
}
