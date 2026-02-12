import { describe, expect, it } from 'vitest'
import { parseMeta, remarkCodeMeta } from './remarkCodeMeta'

describe('parseMeta', () => {
  it('parses boolean flags', () => {
    expect(parseMeta('highlight')).toEqual({ highlight: true })
  })

  it('parses multiple boolean flags', () => {
    expect(parseMeta('highlight copy')).toEqual({
      highlight: true,
      copy: true
    })
  })

  it('parses key=value without quotes', () => {
    expect(parseMeta('lang=js')).toEqual({ lang: 'js' })
  })

  it('parses key=value with quotes', () => {
    expect(parseMeta('title="Hello World"')).toEqual({
      title: 'Hello World'
    })
  })

  it('preserves = inside quoted values', () => {
    expect(parseMeta('title="a=b"')).toEqual({ title: 'a=b' })
  })

  it('parses mixed flags and key=value pairs', () => {
    expect(parseMeta('lang=ts title="My Code" highlight')).toEqual({
      lang: 'ts',
      title: 'My Code',
      highlight: true
    })
  })

  it('returns empty object for empty string', () => {
    expect(parseMeta('')).toEqual({})
  })

  it('handles spacing around =', () => {
    expect(parseMeta('lang = js')).toEqual({ lang: 'js' })
  })
})

describe('remarkCodeMeta', () => {
  const plugin = remarkCodeMeta()

  function code(meta: string | null) {
    return { type: 'code', meta, value: '' }
  }

  it('collects meta from code nodes into file.data.codeMeta', () => {
    const tree = { type: 'root', children: [code('lang=js title="test"')] }
    const file = { data: {} } as any
    plugin(tree, file)

    expect(file.data.codeMeta).toEqual([{ lang: 'js', title: 'test' }])
  })

  it('pushes null for code nodes without meta', () => {
    const tree = { type: 'root', children: [code(null)] }
    const file = { data: {} } as any
    plugin(tree, file)

    expect(file.data.codeMeta).toEqual([null])
  })

  it('collects meta from multiple code nodes in order', () => {
    const tree = { type: 'root', children: [code('lang=js'), code(null), code('highlight')] }
    const file = { data: {} } as any
    plugin(tree, file)

    expect(file.data.codeMeta).toEqual([{ lang: 'js' }, null, { highlight: true }])
  })

  it('initializes file.data if undefined', () => {
    const tree = { type: 'root', children: [code('lang=ts')] }
    const file = {} as any
    plugin(tree, file)

    expect(file.data.codeMeta).toEqual([{ lang: 'ts' }])
  })
})
