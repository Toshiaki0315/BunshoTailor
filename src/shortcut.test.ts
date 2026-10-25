import { describe, it, expect } from 'vitest'
import { shouldRunOnKey, canRun } from './shortcut'

const key = (o: Partial<Parameters<typeof shouldRunOnKey>[0]> = {}) => ({
  key: 'Enter',
  metaKey: true,
  ctrlKey: false,
  isComposing: false,
  keyCode: 13,
  ...o,
})

describe('shouldRunOnKey', () => {
  it('runs on Cmd+Enter', () => {
    expect(shouldRunOnKey(key())).toBe(true)
  })
  it('runs on Ctrl+Enter', () => {
    expect(shouldRunOnKey(key({ metaKey: false, ctrlKey: true }))).toBe(true)
  })
  it('does not run on plain Enter (newline)', () => {
    expect(shouldRunOnKey(key({ metaKey: false }))).toBe(false)
  })
  it('does not run while IME is composing', () => {
    expect(shouldRunOnKey(key({ isComposing: true }))).toBe(false)
    expect(shouldRunOnKey(key({ keyCode: 229 }))).toBe(false)
  })
  it('does not run on other keys', () => {
    expect(shouldRunOnKey(key({ key: 'a' }))).toBe(false)
  })
})

describe('canRun', () => {
  it('rejects blank text', () => {
    expect(canRun('  \n', false)).toBe(false)
  })
  it('rejects while running', () => {
    expect(canRun('hi', true)).toBe(false)
  })
  it('accepts non-blank text when idle', () => {
    expect(canRun('hi', false)).toBe(true)
  })
})
