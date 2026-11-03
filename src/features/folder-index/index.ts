// SPDX-License-Identifier: AGPL-3.0-only
//
// An A-Z strip for the sidebar of Wiki.js 2.x. It appears when the current folder has
// more subfolders than `minFolders`, reads the list Wiki.js already rendered and never
// talks to the network. Anchors: the sidebar (`.v-navigation-drawer`), its list
// (`.v-list`), the "Current Directory" heading (`.v-subheader`) and the folder items
// after it (an `mdi-folder` icon and a `.v-list-item__title`).
import type { Env, Feature, FeatureStatus } from '../../core/types'
import { MARK } from '../../core/dom'
import { LETTERS, firstByLetter } from './letters'

export interface FolderIndexOptions {
  minFolders: number
  side: 'right' | 'left'
}

const ID = 'wjs-folder-index'
const ON = 'wjs-folder-index-on'
const HIT = 'wjs-folder-index-hit'

const TEXT: Record<string, { label: string; go: string; digits: string }> = {
  en: { label: 'Alphabetical folder index', go: 'Jump to folders starting with ', digits: 'digits and symbols' },
  it: { label: 'Indice alfabetico delle cartelle', go: 'Vai alle cartelle con la lettera ', digits: 'numeri e simboli' },
}

function css(side: 'right' | 'left'): string {
  return (
    `#${ID}{position:absolute;${side}:3px;bottom:10px;width:20px;z-index:6;display:flex;flex-direction:column;justify-content:space-between;` +
    `padding:2px 0;border-radius:10px;background:rgba(0,0,0,.28);font:600 clamp(8px,1.55vh,11px)/1 Roboto,sans-serif}` +
    `#${ID} button{all:unset;box-sizing:border-box;flex:1 1 0;min-height:0;display:flex;align-items:center;justify-content:center;` +
    `cursor:pointer;color:rgba(255,255,255,.92);border-radius:8px;margin:0 1px}` +
    `#${ID} button:hover,#${ID} button:focus-visible{background:rgba(255,255,255,.28)}` +
    `#${ID} button:focus-visible{outline:2px solid #fff;outline-offset:-2px}` +
    `#${ID} button[disabled]{cursor:default;opacity:.28;pointer-events:none}` +
    `.theme--light #${ID}{background:rgba(0,0,0,.08)}` +
    `.theme--light #${ID} button{color:rgba(0,0,0,.75)}.theme--light #${ID} button:hover{background:rgba(0,0,0,.14)}` +
    `.${ON} .v-list{padding-${side}:26px!important}` +
    `.${HIT}{animation:${HIT} 1.3s ease-out}` +
    `@keyframes ${HIT}{0%,40%{box-shadow:inset 0 0 0 2px rgba(255,255,255,.9);background:rgba(255,255,255,.18)}100%{box-shadow:none}}`
  )
}

interface FolderItem {
  el: HTMLElement
  title: string
}

/** The subfolders of the current folder: the folder items after the "Current Directory" heading. */
function readFolders(doc: Document): { drawer: HTMLElement; subheader: HTMLElement; items: FolderItem[] } | null {
  const drawer = doc.querySelector<HTMLElement>('.v-navigation-drawer')
  const list = drawer?.querySelector<HTMLElement>('.v-list')
  const subheader = list?.querySelector<HTMLElement>('.v-subheader')
  if (!drawer || !subheader) return null
  const items: FolderItem[] = []
  for (let node = subheader.nextElementSibling; node; node = node.nextElementSibling) {
    const title = node.querySelector('.v-list-item__title')
    if (node.classList.contains('v-list-item') && node.querySelector('.v-icon.mdi-folder') && title) {
      items.push({ el: node as HTMLElement, title: title.textContent ?? '' })
    }
  }
  return { drawer, subheader, items }
}

export const folderIndex: Feature<FolderIndexOptions> = {
  id: 'folderIndex',
  title: 'Folder index (A–Z)',

  normalize(raw, warn) {
    let minFolders = 20
    if (raw.minFolders !== undefined) {
      const n = raw.minFolders
      if (typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 1000) minFolders = n
      else warn('folderIndex.minFolders must be a whole number from 1 to 1000; using 20')
    }
    let side: 'right' | 'left' = 'right'
    if (raw.side !== undefined) {
      if (raw.side === 'right' || raw.side === 'left') side = raw.side
      else warn('folderIndex.side must be "right" or "left"; using "right"')
    }
    return { minFolders, side }
  },

  start(options, env: Env) {
    const text = TEXT[env.language] ?? TEXT.en!
    const removeStyle = env.injectStyle(ID, css(options.side))
    let signature = ''
    let status: FeatureStatus = { state: 'idle', detail: 'not evaluated yet' }

    const remove = () => {
      env.doc.getElementById(ID)?.remove()
      env.doc.querySelector(`.${ON}`)?.classList.remove(ON)
    }

    const update = () => {
      const found = readFolders(env.doc)
      if (!found) {
        signature = ''
        remove()
        status = { state: 'idle', detail: 'sidebar not found (not a page with a sidebar, or Wiki.js changed it)' }
        return
      }
      const { drawer, subheader, items } = found
      if (items.length <= options.minFolders) {
        signature = ''
        remove()
        status = { state: 'idle', detail: `${items.length} subfolders, at most ${options.minFolders}` }
        return
      }
      const next = items.map((i) => i.title).join('\u0001')
      status = { state: 'active', detail: `${items.length} subfolders` }
      if (next === signature && env.doc.getElementById(ID)) return
      signature = next
      remove()

      const first = firstByLetter(items)
      const strip = env.doc.createElement('nav')
      strip.id = ID
      strip.setAttribute(MARK, ID)
      strip.setAttribute('aria-label', text.label)
      // Starts below the "Current Directory" heading, ends at the bottom of the sidebar.
      strip.style.top = `${subheader.getBoundingClientRect().bottom - drawer.getBoundingClientRect().top + 4}px`
      for (const letter of LETTERS) {
        const button = env.doc.createElement('button')
        button.type = 'button'
        button.textContent = letter
        button.setAttribute('aria-label', text.go + (letter === '#' ? text.digits : letter))
        const target = first.get(letter)
        if (!target) button.disabled = true
        else {
          button.addEventListener('click', () => {
            if (typeof target.el.scrollIntoView === 'function') target.el.scrollIntoView({ block: 'start', behavior: 'smooth' })
            target.el.classList.remove(HIT)
            void target.el.offsetWidth // restart the highlight animation
            target.el.classList.add(HIT)
          })
        }
        strip.appendChild(button)
      }
      drawer.appendChild(strip)
      drawer.classList.add(ON)
    }

    const stopWatching = env.watch(update)
    return {
      stop() {
        stopWatching()
        remove()
        removeStyle()
      },
      status: () => status,
    }
  },
}
