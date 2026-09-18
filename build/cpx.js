import cpx from 'cpx'

const staticFolders = ['assets', 'icons', 'lang', 'scripts', 'utils', 'ui', 'exportutils', 'templates']
const staticFiles = ['changelog.md', 'LICENSE.txt', 'README.md', 'system.json', 'template.json']

// `lib/xregexp-all.js` is listed in `system.json` as its own esmodule -- it publishes the XRegExp
// global rather than exporting it -- so it is copied verbatim instead of being bundled, and has to
// keep its `lib/` path.
const staticPairs = [['lib/xregexp-all.js', 'dist/lib']]
const outputBase = 'dist'

// Copy static folders to the output directory
for (const folder of staticFolders) {
  const input = `${folder}/**/*`
  const output = `${outputBase}/${folder}`
  if (process.argv.includes('--watch')) {
    cpx.watch(input, output, {})
  } else {
    cpx.copy(input, output, {})
  }
}

// Copy static files to the output directory
for (const file of staticFiles) {
  const input = `${file}`
  const output = `${outputBase}`
  if (process.argv.includes('--watch')) {
    cpx.watch(input, output, {})
  } else {
    cpx.copy(input, output, {})
  }
}

// Copy individually-placed files to the output directory
for (const [input, output] of staticPairs) {
  if (process.argv.includes('--watch')) {
    cpx.watch(input, output, {})
  } else {
    cpx.copy(input, output, {})
  }
}
