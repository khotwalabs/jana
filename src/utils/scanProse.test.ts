import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { scanProseComponents } from './scanProse'

const TMP = join(import.meta.dirname, '.tmp-test-prose')

describe('scanProseComponents', () => {
  beforeEach(() => {
    mkdirSync(TMP, { recursive: true })
  })

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true })
  })

  function touch(name: string) {
    writeFileSync(join(TMP, name), '')
  }

  it('returns empty map when directory does not exist', () => {
    expect(scanProseComponents('/nonexistent/path', 'src/lib/components/prose')).toEqual({})
  })

  it('discovers known tag components', () => {
    touch('P.svelte')
    touch('H1.svelte')
    touch('Pre.svelte')

    const result = scanProseComponents(TMP, 'src/lib/components/prose')

    expect(result).toEqual({
      p: '$lib/components/prose/P.svelte',
      h1: '$lib/components/prose/H1.svelte',
      pre: '$lib/components/prose/Pre.svelte'
    })
  })

  it('ignores non-svelte files', () => {
    touch('P.svelte')
    touch('README.md')
    touch('utils.ts')

    const result = scanProseComponents(TMP, 'src/lib/components/prose')

    expect(result).toEqual({
      p: '$lib/components/prose/P.svelte'
    })
  })

  it('ignores svelte files that do not match known tags', () => {
    touch('P.svelte')
    touch('CustomWidget.svelte')

    const result = scanProseComponents(TMP, 'src/lib/components/prose')

    expect(result).toEqual({
      p: '$lib/components/prose/P.svelte'
    })
  })

  it('replaces src/lib/ with $lib/ in paths', () => {
    touch('A.svelte')

    const result = scanProseComponents(TMP, 'src/lib/prose')

    expect(result).toEqual({
      a: '$lib/prose/A.svelte'
    })
  })
})
