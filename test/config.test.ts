// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, describe, expect, it, vi } from 'vitest'
import { run, type Controller } from '../src/core/run'
import { folderIndex } from '../src/features/folder-index'
import { mountSidebar, NAMES, settle } from './helpers/sidebar'

const win = window as unknown as Window & typeof globalThis & { WikiJsTweaks?: unknown }
let controller: Controller | null = null
afterEach(() => {
  controller?.stop()
  controller = null
  delete win.WikiJsTweaks
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})

describe('configuration', () => {
  it('runs with no configuration at all and everything off', () => {
    delete win.WikiJsTweaks
    controller = run([folderIndex], win)
    expect(controller?.status().folderIndex?.state).toBe('disabled')
  })

  it('ignores a configuration that is not an object', () => {
    win.WikiJsTweaks = 'yes please'
    controller = run([folderIndex], win)
    expect(controller?.status().folderIndex?.state).toBe('disabled')
  })

  it('needs enabled to be exactly true', () => {
    for (const enabled of ['true', 1, 'yes', {}]) {
      win.WikiJsTweaks = { folderIndex: { enabled } }
      controller = run([folderIndex], win)
      expect(controller?.status().folderIndex?.state).toBe('disabled')
      controller?.stop()
    }
  })

  it('warns about unknown options and falls back on invalid values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mountSidebar(NAMES)
    win.WikiJsTweaks = { folderIndex: { enabled: true, minFolders: '20', side: 'top' }, folderIdnex: {} }
    controller = run([folderIndex], win)
    const messages = warn.mock.calls.map((c) => String(c[1]))
    expect(messages.some((m) => m.includes('unknown option "folderIdnex"'))).toBe(true)
    expect(messages.some((m) => m.includes('minFolders'))).toBe(true)
    expect(messages.some((m) => m.includes('side'))).toBe(true)
  })

  it('does not start twice when the script is pasted twice', async () => {
    mountSidebar(NAMES)
    win.WikiJsTweaks = { folderIndex: { enabled: true } }
    controller = run([folderIndex], win)
    expect(run([folderIndex], win)).toBe(controller)
    await settle()
    expect(document.querySelectorAll('#wjs-folder-index')).toHaveLength(1)
  })

  it('offers status() and stop() on the configuration object, but not as settings', () => {
    win.WikiJsTweaks = { folderIndex: { enabled: false } }
    controller = run([folderIndex], win)
    const config = win.WikiJsTweaks as { status(): unknown; stop(): void }
    expect(typeof config.status).toBe('function')
    expect(Object.keys(config)).toEqual(['folderIndex'])
  })

  it('keeps going when one feature breaks', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const broken = { id: 'broken', title: 'Broken', normalize: () => ({}), start: () => { throw new Error('boom') } }
    win.WikiJsTweaks = { broken: { enabled: true }, folderIndex: { enabled: true } }
    controller = run([broken, folderIndex], win)
    expect(controller?.status().broken?.state).toBe('disabled')
    expect(warn.mock.calls.some((c) => String(c[1]).includes('boom'))).toBe(true)
  })
})
