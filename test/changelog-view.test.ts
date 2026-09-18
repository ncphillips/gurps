import { trimChangelog } from '../lib/changelog-view.ts'
import { SemanticVersion } from '../lib/semver.js'

const CHANGELOG = [
  '# Changelog',
  '## Version 0.18.3',
  '- newest',
  '## Version 0.18.2',
  '- newer',
  '## Version 0.18.1',
  '- older',
].join('\n')

describe('trimChangelog', () => {
  it('keeps only what is newer than the version the world last saw', () => {
    const trimmed = trimChangelog(CHANGELOG, SemanticVersion.fromString('0.18.2'))

    expect(trimmed).toContain('0.18.3')
    expect(trimmed).not.toContain('0.18.2')
    expect(trimmed).not.toContain('0.18.1')
  })

  it('keeps everything for a world that has seen nothing', () => {
    expect(trimChangelog(CHANGELOG, null)).toContain('0.18.1')
  })

  it('stops after five releases, however far behind the world is', () => {
    const many = Array.from({ length: 8 }, (_, index) => `## Version 1.0.${8 - index}\n- entry`).join('\n')

    const trimmed = trimChangelog(many, SemanticVersion.fromString('0.0.1'))

    expect(trimmed.match(/## Version/g)).toHaveLength(5)
  })

  it('returns nothing when the world is already current', () => {
    expect(trimChangelog(CHANGELOG, SemanticVersion.fromString('0.18.3')).trim()).toBe('# Changelog')
  })

  it('strips the links to the releases on GitHub', () => {
    const withLink = '## Version 0.18.3\n<a href="https://example.test">see the release</a>\n- newest'

    expect(trimChangelog(withLink, null)).not.toContain('<a href')
  })
})
