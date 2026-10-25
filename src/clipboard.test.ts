import { describe, it, expect, vi } from 'vitest'
import { copyToClipboard } from './clipboard'

describe('copyToClipboard', () => {
  it('writes text and returns true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    expect(await copyToClipboard('abc', { writeText })).toBe(true)
    expect(writeText).toHaveBeenCalledWith('abc')
  })

  it('returns false when writing fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    expect(await copyToClipboard('abc', { writeText })).toBe(false)
  })

  it('returns false when clipboard is unavailable', async () => {
    expect(await copyToClipboard('abc', undefined)).toBe(false)
  })
})
