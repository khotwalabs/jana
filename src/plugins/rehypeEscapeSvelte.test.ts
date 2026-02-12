import { describe, expect, it } from 'vitest'
import { rehypeEscapeSvelte } from './rehypeEscapeSvelte'

const plugin = rehypeEscapeSvelte()

function makeTree(tagName: string, text: string) {
  return {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName,
        properties: {},
        children: [{ type: 'text', value: text }]
      }
    ]
  }
}

describe('rehypeEscapeSvelte', () => {
  it('escapes curlies in code elements', () => {
    const tree = makeTree('code', '{value}')
    plugin(tree)
    const child = tree.children[0].children[0]
    expect(child.type).toBe('raw')
    expect(child.value).toContain('&#123;')
    expect(child.value).toContain('&#125;')
  })

  it('escapes curlies in pre elements', () => {
    const tree = makeTree('pre', '{value}')
    plugin(tree)
    const child = tree.children[0].children[0]
    expect(child.type).toBe('raw')
    expect(child.value).toContain('&#123;')
  })

  it('does not touch text without curlies', () => {
    const tree = makeTree('code', 'hello world')
    plugin(tree)
    const child = tree.children[0].children[0]
    expect(child.type).toBe('text')
    expect(child.value).toBe('hello world')
  })

  it('does not escape curlies outside code/pre', () => {
    const tree = makeTree('p', '{value}')
    plugin(tree)
    const child = tree.children[0].children[0]
    expect(child.type).toBe('text')
    expect(child.value).toBe('{value}')
  })

  it('escapes all special characters', () => {
    const tree = makeTree('code', '<div>{x}</div>')
    plugin(tree)
    const child = tree.children[0].children[0]
    expect(child.value).toContain('&lt;')
    expect(child.value).toContain('&gt;')
    expect(child.value).toContain('&#123;')
    expect(child.value).toContain('&#125;')
  })
})
