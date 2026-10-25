import { useEffect, useRef, useState } from 'react'
import { copyToClipboard } from './clipboard'

interface Props {
  text: string
}

function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timer.current), [])

  async function handleClick() {
    if (!(await copyToClipboard(text))) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  const label = copied ? 'コピーしました' : 'コピー'

  return (
    <button
      type="button"
      className="copy-button"
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {copied ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
    </button>
  )
}

export default CopyButton
