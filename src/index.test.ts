import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { jana } from './index'

const TMP_ROOT = join(import.meta.dirname, '.tmp-test-root')
const PROSE_DIR = join(TMP_ROOT, 'src/lib/components/prose')

describe('jana transform', () => {
  function setup(components: string[] = []) {
    mkdirSync(PROSE_DIR, { recursive: true })
    for (const name of components) {
      writeFileSync(join(PROSE_DIR, name), '')
    }
  }

  function createPlugin(options = {}) {
    const plugin = jana(options) as any
    plugin.configResolved({ root: TMP_ROOT })
    return plugin
  }

  beforeEach(() => setup())
  afterEach(() => rmSync(TMP_ROOT, { recursive: true, force: true }))

  it('returns null for non-md files', async () => {
    const plugin = createPlugin()
    expect(await plugin.transform('hello', 'file.ts')).toBeNull()
  })

  it('transforms basic markdown to HTML', async () => {
    const plugin = createPlugin()
    const result = await plugin.transform('# Hello\n\nWorld', 'test.md')

    expect(result).not.toBeNull()
    expect(result!.code).toContain('<h1>Hello</h1>')
    expect(result!.code).toContain('<p>World</p>')
  })

  it('escapes Svelte curlies in code blocks', async () => {
    const plugin = createPlugin()
    const md = '```\n{value}\n```'
    const result = await plugin.transform(md, 'test.md')

    expect(result!.code).toContain('&#123;')
    expect(result!.code).toContain('&#125;')
    expect(result!.code).not.toContain('{value}')
  })

  it('uses explicit components option', async () => {
    const plugin = createPlugin({
      components: { p: '$lib/components/P.svelte' }
    })
    const result = await plugin.transform('Hello world', 'test.md')

    expect(result!.code).toContain('<P>')
  })

  it('explicit components override scanned ones', async () => {
    setup(['P.svelte'])
    const plugin = createPlugin({
      components: { p: '$lib/custom/MyP.svelte' }
    })
    const result = await plugin.transform('Hello world', 'test.md')

    expect(result!.code).toContain('<MyP>')
  })

  it('auto-scans prose directory', async () => {
    setup(['P.svelte', 'H1.svelte'])
    const plugin = createPlugin()
    const result = await plugin.transform('# Title\n\nText', 'test.md')

    expect(result!.code).toContain('<P>')
    expect(result!.code).toContain('<H1>')
  })

  it('unwraps Svelte components from paragraphs', async () => {
    const plugin = createPlugin()
    const md = '<MyComponent prop="value" />'
    const result = await plugin.transform(md, 'test.md')

    expect(result!.code).not.toMatch(/<p>\s*<MyComponent/)
  })
})
