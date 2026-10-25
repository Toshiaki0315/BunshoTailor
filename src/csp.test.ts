import { describe, it, expect } from 'vitest'
import config from '../src-tauri/tauri.conf.json'

/** CSP文字列を { ディレクティブ名: 値の配列 } に分解する */
function parseCsp(csp: string): Record<string, string[]> {
  return Object.fromEntries(
    csp
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...values]) => [name, values]),
  )
}

/** Tauri v2 のIPC(アプリ内の通信)用。外部ホストではない */
const TAURI_IPC = 'http://ipc.localhost'

describe('Content Security Policy', () => {
  const csp = config.app.security.csp

  it('is set (not null)', () => {
    expect(typeof csp).toBe('string')
  })

  const directives = parseCsp(String(csp))

  it('defaults to the app itself only', () => {
    expect(directives['default-src']).toEqual(["'self'"])
  })

  it.each(['img-src', 'connect-src', 'font-src', 'media-src', 'frame-src'])(
    '%s does not allow remote hosts',
    (name) => {
      const values = directives[name] ?? directives['default-src']
      values.filter((v) => v !== TAURI_IPC).forEach((v) => {
        expect(v).not.toMatch(/^(https?|wss?):/)
        expect(v).not.toBe('*')
      })
    },
  )

  it('allows the Tauri IPC so that the app can call the backend', () => {
    expect(directives['connect-src']).toEqual(expect.arrayContaining(['ipc:', TAURI_IPC]))
  })

  it('does not allow plugins or base URL changes', () => {
    expect(directives['object-src']).toEqual(["'none'"])
    expect(directives['base-uri']).toEqual(["'none'"])
  })
})
