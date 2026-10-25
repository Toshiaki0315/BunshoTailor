import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  text: string
}

/**
 * 外部への通信や画面遷移を起こさないための置き換え。
 * - 画像: 読み込まず、代替テキストだけを表示する
 * - リンク: クリックできない文字として、リンク文字とURLを表示する
 */
const components: Components = {
  img: ({ alt }) => <span className="md-image">{alt ? `[画像: ${alt}]` : '[画像]'}</span>,
  a: ({ href, children }) => {
    const label = typeof children === 'string' ? children : undefined
    const showUrl = href && href !== label
    return (
      <span className="md-link">
        {children}
        {showUrl && ` (${href})`}
      </span>
    )
  },
}

/** fm の応答(Markdown)を整形して表示する。生HTMLは描画しない。 */
function MarkdownView({ text }: Props) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownView
