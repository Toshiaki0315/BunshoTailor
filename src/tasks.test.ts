import { describe, it, expect } from 'vitest'
import { CATEGORIES, OUTPUT_RULE, findCategory, findOption, firstOptionId } from './tasks'

describe('CATEGORIES', () => {
  it('has the four processing categories', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual(['format', 'rewrite', 'private', 'quick'])
  })

  it('has unique category ids and non-empty labels', () => {
    const ids = CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    CATEGORIES.forEach((c) => expect(c.label.length).toBeGreaterThan(0))
  })

  it('has at least one option per category with unique ids', () => {
    CATEGORIES.forEach((c) => {
      expect(c.options.length).toBeGreaterThan(0)
      const ids = c.options.map((o) => o.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  it('appends the output rule to every instruction', () => {
    CATEGORIES.forEach((c) =>
      c.options.forEach((o) => {
        expect(o.instructions.length).toBeGreaterThan(OUTPUT_RULE.length)
        expect(o.instructions.endsWith(OUTPUT_RULE)).toBe(true)
      }),
    )
  })
})

describe('lookups', () => {
  it('finds a category and an option', () => {
    expect(findCategory('rewrite')?.label).toBe('要約・リライト')
    expect(findOption('rewrite', 'business-mail')?.label).toBe('ビジネスメール調')
  })

  it('returns undefined for unknown ids', () => {
    expect(findCategory('nope')).toBeUndefined()
    expect(findOption('rewrite', 'nope')).toBeUndefined()
    expect(findOption('nope', 'business-mail')).toBeUndefined()
  })

  it('returns the first option id of a category', () => {
    expect(firstOptionId('format')).toBe(CATEGORIES[0].options[0].id)
  })
})
