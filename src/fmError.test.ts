import { describe, it, expect } from 'vitest'
import { parseFmError, LICENSE_COMMAND } from './fmError'

describe('parseFmError', () => {
  it('parses a structured error from the backend', () => {
    expect(parseFmError({ kind: 'license_not_agreed', message: 'm' })).toEqual({
      kind: 'license_not_agreed',
      message: 'm',
    })
  })

  it('parses a timeout error', () => {
    expect(parseFmError({ kind: 'timeout', message: 't' })).toEqual({ kind: 'timeout', message: 't' })
  })

  it('falls back to other for a plain string', () => {
    expect(parseFmError('boom')).toEqual({ kind: 'other', message: 'boom' })
  })

  it('falls back to other for an unknown kind', () => {
    expect(parseFmError({ kind: 'weird', message: 'x' })).toEqual({ kind: 'other', message: 'x' })
  })

  it('handles null and undefined', () => {
    expect(parseFmError(null).kind).toBe('other')
    expect(parseFmError(undefined).kind).toBe('other')
  })

  it('exposes the license command to show to the user', () => {
    expect(LICENSE_COMMAND).toBe('sudo fm license')
  })
})
