import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import sanitizeHtml from 'sanitize-html'

const katexTags = [
  'span', 'math', 'semantics', 'mrow', 'mtext', 'mo', 'mi', 'mn', 'mspace',
  'annotation', 'msup', 'msub', 'mfrac', 'mtable', 'mtr', 'mtd', 'mstyle',
  'mpadded', 'mphantom', 'menclose', 'mover', 'munder', 'munderover', 'msqrt',
  'mroot', 'mlabeledtr', 'maligngroup', 'malignmark'
]

marked.use(markedKatex({
  throwOnError: false,
  displayMode: true
}))

export function renderMarkdown (content: string): string {
  const rawHtml = marked.parse(content, { async: false }) as string
  return sanitizeHtml(rawHtml, {
    allowedTags: [...new Set([
      ...sanitizeHtml.defaults.allowedTags,
      ...katexTags,
      'img',
      'h1',
      'h2'
    ])],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'aria-hidden', 'xmlns', 'display', 'encoding', 'style'],
      span: ['class', 'style', 'aria-hidden'],
      math: ['xmlns', 'display'],
      annotation: ['encoding'],
      img: ['src', 'alt', 'title']
    }
  })
}
