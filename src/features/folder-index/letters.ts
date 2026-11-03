// SPDX-License-Identifier: AGPL-3.0-only

export const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

/** A to Z for names that start with a letter (accents and case ignored), "#" for everything else. */
export function letterOf(title: string): string {
  const first = Array.from(title.trim())[0] ?? ''
  const base = first.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().charAt(0)
  return /^[A-Z]$/.test(base) ? base : '#'
}

/** The first item of every letter, in the order given. */
export function firstByLetter<T extends { title: string }>(items: readonly T[]): Map<string, T> {
  const out = new Map<string, T>()
  for (const item of items) {
    const letter = letterOf(item.title)
    if (!out.has(letter)) out.set(letter, item)
  }
  return out
}
