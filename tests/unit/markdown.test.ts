import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../../apps/api/src/utils/markdown.js'

describe('renderMarkdown', () => {
  it('renders tables with cell content preserved', () => {
    const html = renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<td>1</td>')
    expect(html).toContain('<td>2</td>')
  })

  it('renders block katex formulas', () => {
    const html = renderMarkdown('$$ \\text{run-to-completion} \\rightarrow \\text{async continuation} $$')
    expect(html).toContain('class="katex')
    expect(html).toContain('run-to-completion')
    expect(html).toContain('async')
    expect(html).not.toContain('$$')
  })

  it('renders inline katex formulas', () => {
    const html = renderMarkdown('Energy is $E = mc^2$ here.')
    expect(html).toContain('class="katex')
    expect(html).toContain('mc')
  })
})
