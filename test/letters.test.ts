// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from 'vitest'
import { firstByLetter, letterOf, LETTERS } from '../src/features/folder-index/letters'

describe('letterOf', () => {
  it.each([
    ['Abete', 'A'],
    ['abete', 'A'],
    ['  zafferano', 'Z'],
    ['École', 'E'],
    ['Ñandú', 'N'],
    ['Ångström', 'A'],
    ['01-Prova', '#'],
    ['3Torri', '#'],
    ['_private', '#'],
    ['ß', 'S'],
    ['日本', '#'],
    ['😀 smile', '#'],
    ['', '#'],
  ])('%j → %s', (title, letter) => {
    expect(letterOf(title)).toBe(letter)
  })
})

describe('firstByLetter', () => {
  it('keeps the first item of every letter, in order', () => {
    const items = [{ title: '01-a' }, { title: '3b' }, { title: 'Alfa' }, { title: 'Amaro' }, { title: 'Beta' }]
    const map = firstByLetter(items)
    expect(map.get('#')).toBe(items[0])
    expect(map.get('A')).toBe(items[2])
    expect(map.get('B')).toBe(items[4])
    expect(map.has('C')).toBe(false)
  })

  it('knows the whole strip', () => {
    expect(LETTERS).toHaveLength(27)
    expect(LETTERS[0]).toBe('#')
    expect(LETTERS[26]).toBe('Z')
  })
})
