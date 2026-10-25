interface ClipboardLike {
  writeText(text: string): Promise<void>
}

/** クリップボードへコピーし、成功したかを返す */
export async function copyToClipboard(
  text: string,
  clipboard: ClipboardLike | undefined = globalThis.navigator?.clipboard,
): Promise<boolean> {
  if (!clipboard) return false
  try {
    await clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
