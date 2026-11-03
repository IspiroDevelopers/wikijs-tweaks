// SPDX-License-Identifier: AGPL-3.0-only
//
// Builds dist/wikijs-tweaks.js (readable) and dist/wikijs-tweaks.min.js (smaller), plus SHA256SUMS.
//   node scripts/build.mjs                       all features
//   node scripts/build.mjs --features folderIndex,other     only these (ids of src/features/index.ts)
import { build } from 'esbuild'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const arg = process.argv.indexOf('--features')
const wanted = arg > -1 ? String(process.argv[arg + 1] ?? '').split(',').filter(Boolean) : null

// feature id -> folder, read from the registry so the build never drifts from it
const registry = readFileSync(join(root, 'src/features/index.ts'), 'utf8')
const imports = [...registry.matchAll(/import \{ (\w+) \} from '\.\/([\w-]+)'/g)].map((m) => ({ name: m[1], dir: m[2] }))
const ids = new Map()
for (const { name, dir } of imports) {
  const source = readFileSync(join(root, 'src/features', dir, 'index.ts'), 'utf8')
  const id = source.match(/id: '(\w+)'/)?.[1]
  if (id) ids.set(id, { name, dir })
}
if (wanted) for (const id of wanted) if (!ids.has(id)) throw new Error(`unknown feature "${id}"; known: ${[...ids.keys()].join(', ')}`)
const chosen = [...ids].filter(([id]) => !wanted || wanted.includes(id)).map(([, v]) => v)

const entry = [
  `import { run } from './src/core/run'`,
  ...chosen.map((f) => `import { ${f.name} } from './src/features/${f.dir}'`),
  `run([${chosen.map((f) => f.name).join(', ')}])`,
].join('\n')

const banner = `/*! wikijs-tweaks v${pkg.version} (AGPL-3.0-only) https://github.com/IspiroDevelopers/wikijs-tweaks${wanted ? ` | features: ${wanted.join(', ')}` : ''} */`
const out = join(root, 'dist')
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
for (const minify of [false, true]) {
  await build({
    stdin: { contents: entry, resolveDir: root, sourcefile: 'entry.ts', loader: 'ts' },
    outfile: join(out, minify ? 'wikijs-tweaks.min.js' : 'wikijs-tweaks.js'),
    bundle: true,
    format: 'iife',
    target: 'es2019',
    minify,
    legalComments: 'none',
    banner: { js: banner },
    logLevel: 'warning',
  })
}
const sums = readdirSync(out).sort().map((f) => `${createHash('sha256').update(readFileSync(join(out, f))).digest('hex')}  ${f}`)
writeFileSync(join(out, 'SHA256SUMS'), sums.join('\n') + '\n')
console.log(`Built dist/ (${chosen.length} feature${chosen.length === 1 ? '' : 's'}): ${readdirSync(out).join(', ')}`)
