import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import MarkdownView from './MarkdownView'

const render = (text: string) => renderToStaticMarkup(<MarkdownView text={text} />)

describe('MarkdownView', () => {
  it('renders headings and bold text', () => {
    const html = render('# 見出し\n\n**太字**')
    expect(html).toContain('<h1>見出し</h1>')
    expect(html).toContain('<strong>太字</strong>')
  })

  it('renders lists', () => {
    const html = render('- a\n- b')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>a</li>')
  })

  it('renders fenced code blocks', () => {
    const html = render('```\nlet x = 1\n```')
    expect(html).toContain('<pre><code>')
  })

  it('renders GFM tables', () => {
    const html = render('|a|b|\n|-|-|\n|1|2|')
    expect(html).toContain('<table>')
  })

  it('does not render raw HTML', () => {
    const html = render('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
  })

  it('renders nothing for empty text', () => {
    expect(render('')).toBe('<div class="markdown"></div>')
  })
})
