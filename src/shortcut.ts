interface KeyInfo {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  isComposing: boolean
  keyCode?: number
}

/** IMEが処理中のキーを示す keyCode */
const IME_PROCESS_KEYCODE = 229

/** Cmd/Ctrl+Enterで実行。IME変換中は実行しない */
export function shouldRunOnKey(e: KeyInfo): boolean {
  if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey)) return false
  return !(e.isComposing || e.keyCode === IME_PROCESS_KEYCODE)
}

export function canRun(text: string, running: boolean): boolean {
  return !running && text.trim().length > 0
}
