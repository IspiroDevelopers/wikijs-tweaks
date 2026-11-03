// SPDX-License-Identifier: AGPL-3.0-only
// Guards the promises in docs/architecture.md: one self-contained file that never touches the network.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const root = join(__dirname, '..')

describe('built bundle', () => {
  beforeAll(() => {
    execFileSync('node', ['scripts/build.mjs'], { cwd: root, stdio: 'pipe' })
  })

  it('is a single readable file with a version banner, plus a minified one and checksums', () => {
    expect(readdirSync(join(root, 'dist')).sort()).toEqual(['SHA256SUMS', 'wikijs-tweaks.js', 'wikijs-tweaks.min.js'])
    expect(readFileSync(join(root, 'dist/wikijs-tweaks.js'), 'utf8')).toMatch(/^\/\*! wikijs-tweaks v\d+\.\d+\.\d+ \(AGPL-3\.0-only\)/)
  })

  it('has no way to reach the network or run strings as code', () => {
    const forbidden = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts|eval|Function)\s*\(|new\s+(Function|WebSocket|XMLHttpRequest|EventSource)\b|\.innerHTML\s*=|document\.write|localStorage|sessionStorage|document\.cookie/
    for (const name of ['wikijs-tweaks.js', 'wikijs-tweaks.min.js']) {
      expect(readFileSync(join(root, 'dist', name), 'utf8')).not.toMatch(forbidden)
    }
  })

  it('does nothing when loaded without configuration', () => {
    const code = readFileSync(join(root, 'dist/wikijs-tweaks.min.js'), 'utf8')
    document.body.innerHTML = ''
    new Function(code)() // eslint-disable-line no-new-func
    expect(document.querySelector('[data-wjs-tweaks]')).toBeNull()
    const config = (window as unknown as { WikiJsTweaks: { status(): Record<string, { state: string }> } }).WikiJsTweaks
    expect(config.status().folderIndex?.state).toBe('disabled')
  })

  it('can be built with a subset of features and refuses unknown ones', () => {
    expect(execFileSync('node', ['scripts/build.mjs', '--features', 'folderIndex'], { cwd: root }).toString()).toContain('1 feature')
    expect(() => execFileSync('node', ['scripts/build.mjs', '--features', 'nope'], { cwd: root, stdio: 'pipe' })).toThrow()
    execFileSync('node', ['scripts/build.mjs'], { cwd: root, stdio: 'pipe' })
    expect(existsSync(join(root, 'dist/wikijs-tweaks.js'))).toBe(true)
  })
})
