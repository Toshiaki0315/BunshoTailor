import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  text: string
}

/** fm の応答(Markdown)を整形して表示する。生HTMLは描画しない。 */
function MarkdownView({ text }: Props) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}

export default MarkdownView
