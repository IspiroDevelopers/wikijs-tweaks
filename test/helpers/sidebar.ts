// SPDX-License-Identifier: AGPL-3.0-only
// Builds the markup Wiki.js 2.x renders for its sidebar in folder-browsing mode
// (structure taken from a real Wiki.js 2.5 page; names are invented).

export const NAMES = [
  '01-Prova', '3Torri', '4Venti', 'Abete', 'Acero', 'Agave', 'Alloro', 'Amaranto', 'Ambra', 'Arancio', 'Azalea',
  'Bambu', 'Basilico', 'Begonia', 'Calendula', 'Camelia', 'Dalia', 'Edera', 'Felce', 'Ginepro', 'Lavanda', 'Magnolia',
  'Menta', 'Olivo', 'Quercia', 'Salvia', 'Zafferano',
]

const item = (title: string, icon = 'mdi-folder', color = '') =>
  `<div tabindex="0" class="v-list-item v-list-item--link theme--dark"><div class="v-avatar v-list-item__avatar">` +
  `<i aria-hidden="true" class="v-icon notranslate mdi ${icon} theme--dark"></i></div><div class="v-list-item__title"${color ? ` style="color:${color}"` : ''}>${title}</div></div>`

export function sidebarHtml(folders: readonly string[], pages: readonly string[] = ['Home'], color = ''): string {
  return (
    `<div class="v-navigation-drawer theme--dark primary"><div class="v-navigation-drawer__content"><div><hr class="v-divider">` +
    `<div class="v-list py-2 v-sheet theme--dark v-list--dense primary">` +
    item('/ sidebar.root', 'mdi-folder-open') +
    item('clienti', 'mdi-folder-open') +
    `<hr class="mt-2 v-divider"><div class="v-subheader pl-4 theme--dark">Current Directory</div>` +
    folders.map((f) => item(f, 'mdi-folder', color)).join('') +
    pages.map((p) => item(p, 'mdi-text-box')).join('') +
    `</div></div></div></div>`
  )
}

export function mountSidebar(folders: readonly string[], pages?: readonly string[], color?: string): void {
  document.body.innerHTML = sidebarHtml(folders, pages, color)
}

export const settle = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))
