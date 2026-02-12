import { describe, expect, it } from 'vitest'
import { rehypeComponents } from './rehypeComponents'

function makeTree(children: any[]) {
  return { type: 'root', children }
}

function element(tagName: string, children: any[] = []) {
  return { type: 'element', tagName, properties: {}, children }
}

function text(value: string) {
  return { type: 'text', value }
}

function raw(value: string) {
  return { type: 'raw', value }
}

describe('rehypeComponents', () => {
  it('wraps matched elements with component tags', () => {
    const tree = makeTree([element('p', [text('hello')])])
    const plugin = rehypeComponents({ p: '$lib/prose/P.svelte' })
    plugin(tree, { data: {} } as any)

    const wrapped = tree.children.find((n: any) => n.type === 'element' && n.tagName === 'P')
    expect(wrapped).toBeDefined()
    expect(wrapped.children[0].tagName).toBe('p')
  })

  it('wraps heading elements', () => {
    const tree = makeTree([element('h1', [text('Title')])])
    const plugin = rehypeComponents({ h1: '$lib/prose/H1.svelte' })
    plugin(tree, { data: {} } as any)

    const wrapped = tree.children.find((n: any) => n.type === 'element' && n.tagName === 'H1')
    expect(wrapped).toBeDefined()
  })

  it('creates script block when none exists', () => {
    const tree = makeTree([element('p', [text('hello')])])
    const plugin = rehypeComponents({ p: '$lib/prose/P.svelte' })
    plugin(tree, { data: {} } as any)

    const script = tree.children.find((n: any) => n.type === 'raw' && n.value.includes('<script'))
    expect(script).toBeDefined()
    expect(script.value).toContain('import P from "$lib/prose/P.svelte"')
  })

  it('injects imports into existing script block', () => {
    const tree = makeTree([raw('<script>\nlet x = 1\n</script>'), element('p', [text('hello')])])
    const plugin = rehypeComponents({ p: '$lib/prose/P.svelte' })
    plugin(tree, { data: {} } as any)

    const script = tree.children.find((n: any) => n.type === 'raw' && n.value.includes('<script'))
    expect(script.value).toContain('import P from "$lib/prose/P.svelte"')
    expect(script.value).toContain('let x = 1')
  })

  it('skips already imported components', () => {
    const tree = makeTree([
      raw('<script>\nimport P from "$lib/prose/P.svelte"\n</script>'),
      element('p', [text('hello')])
    ])
    const plugin = rehypeComponents({ p: '$lib/prose/P.svelte' })
    plugin(tree, { data: {} } as any)

    const script = tree.children.find((n: any) => n.type === 'raw' && n.value.includes('<script'))
    const matches = script.value.match(/import P/g)
    expect(matches).toHaveLength(1)
  })

  it('does not inject into script module', () => {
    const tree = makeTree([
      raw('<script module>\nlet x = 1\n</script>'),
      element('p', [text('hello')])
    ])
    const plugin = rehypeComponents({ p: '$lib/prose/P.svelte' })
    plugin(tree, { data: {} } as any)

    const moduleScript = tree.children.find(
      (n: any) => n.type === 'raw' && n.value.includes('<script module')
    )
    expect(moduleScript.value).not.toContain('import P')

    const instanceScript = tree.children.find(
      (n: any) => n.type === 'raw' && n.value.includes('<script>')
    )
    expect(instanceScript.value).toContain('import P from "$lib/prose/P.svelte"')
  })

  it('attaches code meta to pre wrappers', () => {
    const tree = makeTree([element('pre', [element('code', [text('code')])])])
    const plugin = rehypeComponents({ pre: '$lib/prose/Pre.svelte' })
    plugin(tree, { data: { codeMeta: [{ lang: 'js', title: 'test' }] } } as any)

    const wrapped = tree.children.find((n: any) => n.type === 'element' && n.tagName === 'Pre')
    expect(wrapped.properties).toEqual({ lang: 'js', title: 'test' })
  })
})
