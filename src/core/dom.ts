// SPDX-License-Identifier: AGPL-3.0-only
import type { Env } from './types'

/** Attribute that marks everything this script adds to the page. Changes inside such elements are ignored. */
export const MARK = 'data-wjs-tweaks'

export function createEnv(win: Window & typeof globalThis, language: string, debug: boolean): Env {
  const doc = win.document
  return {
    doc,
    win,
    language,
    log: (...args) => {
      if (debug) console.info('[wikijs-tweaks]', ...args)
    },
    injectStyle(id, css) {
      const style = doc.createElement('style')
      style.setAttribute(MARK, id)
      style.textContent = css
      doc.head.appendChild(style)
      return () => style.remove()
    },
    watch(callback) {
      let timer: number | undefined
      const schedule = () => {
        if (timer !== undefined) win.clearTimeout(timer)
        timer = win.setTimeout(callback, 120)
      }
      const observer = new win.MutationObserver((records) => {
        // Our own changes must not trigger another run.
        if (records.some((r) => !(r.target as Element).closest?.(`[${MARK}]`))) schedule()
      })
      observer.observe(doc.body, { childList: true, subtree: true })
      callback()
      return () => {
        observer.disconnect()
        if (timer !== undefined) win.clearTimeout(timer)
      }
    },
  }
}
