// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { run, type Controller } from '../src/core/run'
import { brightness, colorsFrom, folderIndex } from '../src/features/folder-index'
import { mountSidebar, NAMES, settle } from './helpers/sidebar'

const win = window as unknown as Window & typeof globalThis & { WikiJsTweaks?: unknown }
let controller: Controller | null = null

function start(config: unknown): Controller {
  win.WikiJsTweaks = config
  controller = run([folderIndex], win)
  return controller!
}
const strip = () => document.getElementById('wjs-folder-index')
const buttons = () => [...document.querySelectorAll<HTMLButtonElement>('#wjs-folder-index button')]

beforeEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})
afterEach(() => {
  controller?.stop()
  controller = null
  delete win.WikiJsTweaks
  vi.restoreAllMocks()
})

describe('folder index', () => {
  it('does nothing unless it is enabled', async () => {
    mountSidebar(NAMES)
    const c = start({})
    await settle()
    expect(strip()).toBeNull()
    expect(c.status().folderIndex?.state).toBe('disabled')
    expect(document.querySelector('style[data-wjs-tweaks]')).toBeNull()
  })

  it('shows the strip when the folder has more than minFolders subfolders', async () => {
    mountSidebar(NAMES)
    const c = start({ folderIndex: { enabled: true } })
    await settle()
    expect(strip()).not.toBeNull()
    expect(buttons().map((b) => b.textContent).join('')).toBe('#ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    expect(c.status().folderIndex?.state).toBe('active')
  })

  it('disables letters without folders and enables the others', async () => {
    mountSidebar(NAMES)
    start({ folderIndex: { enabled: true } })
    await settle()
    const state = Object.fromEntries(buttons().map((b) => [b.textContent, b.disabled]))
    expect(state['#']).toBe(false) // 01-Prova, 3Torri, 4Venti
    expect(state.A).toBe(false)
    expect(state.Z).toBe(false)
    expect(state.J).toBe(true)
    expect(state.W).toBe(true)
  })

  it('stays away from folders with few subfolders', async () => {
    mountSidebar(NAMES.slice(0, 5))
    const c = start({ folderIndex: { enabled: true } })
    await settle()
    expect(strip()).toBeNull()
    expect(c.status().folderIndex).toMatchObject({ state: 'idle' })
    expect(c.status().folderIndex?.detail).toContain('5 subfolders')
  })

  it('counts only folders, not pages', async () => {
    mountSidebar(NAMES.slice(0, 10), NAMES.slice(10).map((n) => `${n} page`))
    start({ folderIndex: { enabled: true } })
    await settle()
    expect(strip()).toBeNull()
  })

  it('honours minFolders', async () => {
    mountSidebar(NAMES.slice(0, 8))
    start({ folderIndex: { enabled: true, minFolders: 5 } })
    await settle()
    expect(strip()).not.toBeNull()
  })

  it('scrolls to the first folder of the letter and highlights it', async () => {
    mountSidebar(NAMES)
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    start({ folderIndex: { enabled: true } })
    await settle()
    buttons().find((b) => b.textContent === 'A')!.click()
    const target = [...document.querySelectorAll('.v-list-item')].find((e) => e.textContent === 'Abete')!
    expect(scroll).toHaveBeenCalledTimes(1)
    expect(scroll.mock.contexts[0]).toBe(target)
    expect(target.classList.contains('wjs-folder-index-hit')).toBe(true)
  })

  it('appears and disappears as the sidebar changes, without piling up', async () => {
    mountSidebar(NAMES)
    start({ folderIndex: { enabled: true } })
    await settle()
    expect(document.querySelectorAll('#wjs-folder-index')).toHaveLength(1)

    mountSidebar(NAMES.slice(0, 3)) // moved into a small folder
    await settle()
    expect(strip()).toBeNull()
    expect(document.querySelector('.wjs-folder-index-on')).toBeNull()

    mountSidebar(NAMES) // and back
    await settle()
    expect(document.querySelectorAll('#wjs-folder-index')).toHaveLength(1)

    document.querySelector('.v-list')!.appendChild(document.createElement('div')) // unrelated change
    await settle()
    expect(document.querySelectorAll('#wjs-folder-index')).toHaveLength(1)
  })

  it('reports a sidebar it cannot recognise instead of failing', async () => {
    document.body.innerHTML = '<div>no sidebar here</div>'
    const c = start({ folderIndex: { enabled: true } })
    await settle()
    expect(c.status().folderIndex?.state).toBe('idle')
    expect(c.status().folderIndex?.detail).toContain('sidebar not found')
  })

  it('can sit on the left', async () => {
    mountSidebar(NAMES)
    start({ folderIndex: { enabled: true, side: 'left' } })
    await settle()
    expect(document.querySelector('style[data-wjs-tweaks="wjs-folder-index"]')?.textContent).toContain('left:3px')
  })

  it('removes everything when stopped', async () => {
    mountSidebar(NAMES)
    const c = start({ folderIndex: { enabled: true } })
    await settle()
    c.stop()
    expect(strip()).toBeNull()
    expect(document.querySelector('style[data-wjs-tweaks]')).toBeNull()
    expect(document.querySelector('.wjs-folder-index-on')).toBeNull()
  })

  it('writes the labels in Italian when the browser asks for it', async () => {
    mountSidebar(NAMES)
    start({ folderIndex: { enabled: true }, language: 'it' })
    await settle()
    expect(strip()?.getAttribute('aria-label')).toBe('Indice alfabetico delle cartelle')
    expect(buttons().find((b) => b.textContent === 'M')?.getAttribute('aria-label')).toBe('Vai alle cartelle con la lettera M')
  })

  it('takes its colours from the folder names, so a light name gives white letters', async () => {
    mountSidebar(NAMES, undefined, 'rgb(255, 255, 255)')
    start({ folderIndex: { enabled: true } })
    await settle()
    const drawer = document.querySelector<HTMLElement>('.v-navigation-drawer')!
    expect(drawer.style.getPropertyValue('--wjs-fg')).toBe('rgb(255, 255, 255)')
    expect(drawer.style.getPropertyValue('--wjs-band')).toBe('rgba(0,0,0,.28)')
  })

  it('uses dark letters on a light sidebar', async () => {
    mountSidebar(NAMES, undefined, 'rgb(33, 33, 33)')
    const c = start({ folderIndex: { enabled: true } })
    await settle()
    const drawer = document.querySelector<HTMLElement>('.v-navigation-drawer')!
    expect(drawer.style.getPropertyValue('--wjs-fg')).toBe('rgb(33, 33, 33)')
    expect(drawer.style.getPropertyValue('--wjs-hover')).toBe('rgba(0,0,0,.14)')
    c.stop()
    expect(drawer.style.getPropertyValue('--wjs-fg')).toBe('')
  })

  it('does not depend on the theme class of the page', async () => {
    document.documentElement.classList.add('theme--light')
    mountSidebar(NAMES, undefined, 'rgb(255, 255, 255)')
    start({ folderIndex: { enabled: true } })
    await settle()
    expect(document.querySelector('style[data-wjs-tweaks]')?.textContent).not.toContain('theme--light')
    document.documentElement.classList.remove('theme--light')
  })

  it('reads colours', () => {
    expect(brightness('rgb(255, 255, 255)')).toBe(1)
    expect(brightness('rgba(0, 0, 0, 0.5)')).toBe(0)
    expect(brightness('not a colour')).toBeNull()
    expect(colorsFrom('')['--wjs-fg']).toBe('#fff') // unknown colour: assume a dark sidebar
  })

  it('uses only text, never markup, for what it shows', async () => {
    mountSidebar(['<img src=x onerror=alert(1)>', ...NAMES])
    start({ folderIndex: { enabled: true } })
    await settle()
    expect(strip()?.querySelector('img')).toBeNull()
  })
})
