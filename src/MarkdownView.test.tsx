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

  it('does not load remote images (shows alt text instead)', () => {
    const html = render('![ロゴ](https://example.com/t.png)')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('https://example.com/t.png')
    expect(html).toContain('ロゴ')
  })

  it('does not render clickable links (keeps the text and URL)', () => {
    const html = render('[サイト](https://example.com/a)')
    expect(html).not.toContain('<a')
    expect(html).toContain('サイト')
    expect(html).toContain('https://example.com/a')
  })

  it('does not render bare URLs (GFM autolinks) as links', () => {
    const html = render('詳しくは https://example.com/b を参照')
    expect(html).not.toContain('<a')
    expect(html).toContain('https://example.com/b')
  })

  it('shows the URL only once when the link text is the URL itself', () => {
    const html = render('https://example.com/c')
    expect(html.split('https://example.com/c').length - 1).toBe(1)
  })

  it('renders nothing for empty text', () => {
    expect(render('')).toBe('<div class="markdown"></div>')
  })
})
