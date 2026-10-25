import { useReducer, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import CopyButton from './CopyButton'
import MarkdownView from './MarkdownView'
import { LICENSE_COMMAND, parseFmError } from './fmError'
import { initialRunState, runReducer } from './runState'
import { canRun, shouldRunOnKey } from './shortcut'
import { CATEGORIES, findCategory, findOption, firstOptionId } from './tasks'

function App() {
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id)
  const [optionId, setOptionId] = useState(firstOptionId(CATEGORIES[0].id))
  const [input, setInput] = useState('')
  const [{ output, errorMessage, running }, dispatch] = useReducer(runReducer, initialRunState)
  const [renderMarkdown, setRenderMarkdown] = useState(false)
  const [showLicenseDialog, setShowLicenseDialog] = useState(false)

  const category = findCategory(categoryId)
  const selected = findOption(categoryId, optionId)

  function selectCategory(id: string) {
    setCategoryId(id)
    setOptionId(firstOptionId(id))
  }

  async function run() {
    if (!selected || !canRun(input, running)) return
    dispatch({ type: 'start' })
    try {
      const res: string = await invoke('run_fm_task', {
        instructions: selected.instructions,
        text: input,
      })
      dispatch({ type: 'success', output: res })
    } catch (err) {
      console.error(err)
      const error = parseFmError(err)
      setShowLicenseDialog(error.kind === 'license_not_agreed')
      dispatch({ type: 'failure', message: error.message })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const info = {
      key: e.key,
      metaKey: e.metaKey,
      ctrlKey: e.ctrlKey,
      isComposing: e.nativeEvent.isComposing,
      keyCode: e.keyCode,
    }
    if (!shouldRunOnKey(info)) return
    e.preventDefault()
    void run()
  }

  function clearAll() {
    setInput('')
    dispatch({ type: 'clear' })
  }

  return (
    <div className="app">
      <nav className="tabs" role="tablist" aria-label="処理の種類">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === categoryId}
            className={`tab ${c.id === categoryId ? 'active' : ''}`}
            onClick={() => selectCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <div className="options" role="radiogroup" aria-label="処理内容">
        {category?.options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={o.id === optionId}
            className={`chip ${o.id === optionId ? 'active' : ''}`}
            onClick={() => setOptionId(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <main className="panes">
        <section className="pane">
          <div className="pane-header">
            <span>入力</span>
            <button type="button" className="text-button" onClick={clearAll}>
              クリア
            </button>
          </div>
          <textarea
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="処理したい文章を入力または貼り付けてください"
          />
        </section>

        <section className="pane">
          <div className="pane-header">
            <span>結果</span>
            <div className="pane-tools">
              <label className="toggle">
                <input type="checkbox" checked={renderMarkdown} onChange={(e) => setRenderMarkdown(e.target.checked)} />
                Markdownで表示
              </label>
              {output && <CopyButton text={output} />}
            </div>
          </div>
          <div className="output">
            {errorMessage && <div className="error">{errorMessage}</div>}
            {renderMarkdown ? <MarkdownView text={output} /> : <pre className="plain-output">{output}</pre>}
          </div>
        </section>
      </main>

      <div className="actions">
        <span className="hint">⌘+Enterでも実行できます</span>
        <button type="button" className="primary" onClick={() => void run()} disabled={!canRun(input, running)}>
          {running ? '処理中...' : '実行'}
        </button>
      </div>

      {showLicenseDialog && (
        <div role="dialog" aria-modal="true" aria-labelledby="license-title" style={overlayStyle}>
          <div style={dialogStyle}>
            <h2 id="license-title">初回セットアップが必要です</h2>
            <p>
              fm のライセンスに未同意です。ターミナルを開いて次のコマンドを実行し、
              内容を確認のうえ同意してください(管理者パスワードが必要です)。
            </p>
            <pre style={{ background: '#eee', padding: '8px' }}>{LICENSE_COMMAND}</pre>
            <p>同意が完了したら、もう一度実行してください。</p>
            <button style={buttonStyle} onClick={() => navigator.clipboard?.writeText(LICENSE_COMMAND)}>
              コマンドをコピー
            </button>{' '}
            <button style={buttonStyle} onClick={() => setShowLicenseDialog(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  fontSize: '18px',
  padding: '6px 20px',
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const dialogStyle: React.CSSProperties = {
  background: '#fff',
  color: '#000',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '480px',
}

export default App
