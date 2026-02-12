import { describe, expect, it } from 'vitest'
import { remarkComponentToBlock } from './remarkComponentToBlock'

const plugin = remarkComponentToBlock()

function makeTree(children: any[]) {
  return { type: 'root', children }
}

function paragraph(...children: any[]) {
  return { type: 'paragraph', children }
}

function html(value: string) {
  return { type: 'html', value }
}

function text(value: string) {
  return { type: 'text', value }
}

describe('remarkComponentToBlock', () => {
  it('unwraps Svelte component from paragraph', () => {
    const tree = makeTree([paragraph(html('<MyComponent />'))])
    plugin(tree)
    expect(tree.children[0].type).toBe('html')
    expect(tree.children[0].value).toBe('<MyComponent />')
  })

  it('leaves lowercase HTML in paragraph', () => {
    const tree = makeTree([paragraph(html('<div>hello</div>'))])
    plugin(tree)
    expect(tree.children[0].type).toBe('paragraph')
  })

  it('leaves multi-child paragraphs untouched', () => {
    const tree = makeTree([paragraph(text('before '), html('<MyComponent />'))])
    plugin(tree)
    expect(tree.children[0].type).toBe('paragraph')
  })

  it('unwraps component with props', () => {
    const tree = makeTree([paragraph(html('<Alert type="warning" />'))])
    plugin(tree)
    expect(tree.children[0].type).toBe('html')
  })

  it('does not unwrap non-html children', () => {
    const tree = makeTree([paragraph(text('just text'))])
    plugin(tree)
    expect(tree.children[0].type).toBe('paragraph')
  })
})
