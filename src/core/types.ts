// SPDX-License-Identifier: AGPL-3.0-only

/** What a feature may use. Everything goes through here so features stay small and testable. */
export interface Env {
  doc: Document
  win: Window
  /** Two-letter UI language of the browser, or the one forced with the `language` option. */
  language: string
  /** Calls `callback` now and, debounced, after every change of the page (Wiki.js is a single-page app). Returns a function that stops it. */
  watch(callback: () => void): () => void
  /** Adds a <style> element and returns a function that removes it. */
  injectStyle(id: string, css: string): () => void
  log(...args: unknown[]): void
}

export type FeatureState = 'active' | 'idle' | 'disabled'

export interface FeatureStatus {
  state: FeatureState
  /** Why a feature is idle, e.g. "sidebar not found". */
  detail?: string
}

export interface RunningFeature {
  /** Undoes everything the feature added to the page. */
  stop(): void
  status(): FeatureStatus
}

export interface Feature<O extends object = Record<string, unknown>> {
  /** Key in the configuration object, e.g. `folderIndex`. */
  id: string
  /** Human name, used in the documentation and in `status()`. */
  title: string
  /** Turns the raw, user-supplied options into valid ones; bad values fall back to the defaults. */
  normalize(raw: Record<string, unknown>, warn: (message: string) => void): O
  start(options: O, env: Env): RunningFeature
}
