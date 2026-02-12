# Jana

[![CI](https://github.com/abdrizik/jana/actions/workflows/ci.yml/badge.svg)](https://github.com/abdrizik/jana/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/abdrizik/jana/graph/badge.svg)](https://codecov.io/gh/abdrizik/jana)

A Vite plugin that transforms Markdown files into HTML, allowing you to import and use Svelte components directly in your Markdown content. Extensible with remark and rehype plugins.

## Features

- **Import Svelte components inside Markdown files** - Use Svelte components directly in your Markdown content
- **Prose components** - Auto-replace HTML tags (`<p>`, `<h1>`, `<pre>`, etc.) with your custom Svelte components
- Automatic escaping of Svelte syntax (`{`, `}`) in code blocks
- Full Markdown to HTML conversion
- Extensible with remark and rehype plugins
- Fast and lightweight (no syntax highlighting overhead)
- SvelteKit and Vite compatible

## Installation

```bash
npm install @khotwa/jana
```

## Usage

### Basic Setup

#### 1. Add Jana to Vite Config

Add Jana to your `vite.config.js` or `vite.config.ts`:

```js
import { defineConfig } from 'vite'
import { jana } from '@khotwa/jana'

export default defineConfig({
  plugins: [
    jana()
    // ... other plugins
  ]
})
```

#### 2. Configure Svelte Extensions

Add `.md` to the extensions in your `svelte.config.js`:

```js
const config = {
  extensions: ['.svelte', '.md']
  // ... rest of your config
}
```

### Using Markdown Files

#### Option 1: Import as a Component

Import Markdown files directly as Svelte components:

```svelte
<script>
  import Post from './Post.md'
</script>

<Post />
```

#### Option 2: Use as SvelteKit Route File

In SvelteKit, you can use Markdown files directly as route pages:

```txt
src/routes/blog/+page.md
```

The Markdown file will be automatically processed and rendered as a Svelte page when accessed via the route.

### Using Svelte Components in Markdown

You can import and use Svelte components directly inside your Markdown files:

```markdown
<script>
  import MyComponent from './MyComponent.svelte'
</script>

# My Blog Post

This is regular markdown content.

<MyComponent />

You can use components anywhere in your markdown!
```

## Prose Components

Prose components let you replace standard HTML tags with your own Svelte components. For example, you can replace every `<p>` with a custom `<P>` component that adds styling, or every `<pre>` with a `<Pre>` component that adds a copy button.

### Auto-Scan (default)

By default, Jana scans `src/lib/components/prose/` for Svelte files that match known HTML tag names:

```
src/lib/components/prose/
  P.svelte      → wraps all <p> tags
  H1.svelte     → wraps all <h1> tags
  Pre.svelte    → wraps all <pre> tags
  Code.svelte   → wraps all <code> tags
  A.svelte      → wraps all <a> tags
```

Just create the file and Jana picks it up automatically. No config needed.

Supported tag names: `A`, `Blockquote`, `Code`, `Em`, `H1`-`H6`, `Hr`, `Img`, `Li`, `Ol`, `P`, `Pre`, `Strong`, `Table`, `Tbody`, `Td`, `Th`, `Thead`, `Tr`, `Ul`.

### Custom Prose Directory

Change the scan directory with the `prose` option:

```js
jana({
  prose: 'src/components/prose'
})
```

### Explicit Components

Map HTML tags to specific component paths directly:

```js
jana({
  components: {
    p: '$lib/components/P.svelte',
    pre: '$lib/components/CodeBlock.svelte',
    h1: '$lib/components/Heading.svelte'
  }
})
```

Explicit components override auto-scanned ones, so you can use both — auto-scan for most tags and explicit config for specific overrides.

### Code Block Metadata

When you use a prose component for `pre`, Jana automatically passes code block metadata as props:

````markdown
```js title="example.js" highlight
console.log('hello')
```
````

Your `Pre.svelte` component receives:

```svelte
<script>
  let { lang, title, highlight, children } = $props()
  // lang = "js", title = "example.js", highlight = true
</script>
```

## Advanced Usage

### Custom Unified Plugins

Jana supports adding custom [remark](https://github.com/remarkjs/remark) and [rehype](https://github.com/rehypejs/rehype) plugins to extend functionality:

```js
import { defineConfig } from 'vite'
import { jana } from '@khotwa/jana'
import remarkGfm from 'remark-gfm'
import rehypeShiki from 'rehype-shiki'

export default defineConfig({
  plugins: [
    jana({
      plugins: {
        remark: [remarkGfm],
        rehype: [[rehypeShiki, { theme: 'github-dark' }]]
      }
    })
  ]
})
```

**Plugin format:**

- Plugins can be passed as a function: `[remarkGfm]`
- Or as a tuple with options: `[[rehypeSlug, { prefix: "heading-" }]]`

### Full Configuration

```js
jana({
  // Custom prose directory (default: 'src/lib/components/prose')
  prose: 'src/lib/components/prose',

  // Explicit component mappings (override auto-scanned ones)
  components: {
    pre: '$lib/components/CodeBlock.svelte'
  },

  // Custom unified plugins
  plugins: {
    remark: [remarkGfm],
    rehype: [rehypeSlug]
  }
})
```

## How It Works

Jana uses the [unified](https://unifiedjs.com/) ecosystem to process Markdown:

1. **Parse** — Converts Markdown to an abstract syntax tree (AST) with `remark-parse`
2. **Unwrap** — Lifts Svelte components out of `<p>` wrappers (remark treats them as inline)
3. **Collect metadata** — Extracts code block meta (lang, title, etc.) for prose components
4. **User remark plugins** — Runs any custom remark plugins
5. **Transform** — Converts the Markdown AST to HTML AST with `remark-rehype`
6. **User rehype plugins** — Runs any custom rehype plugins
7. **Wrap elements** — Replaces matched HTML tags with Svelte component wrappers
8. **Escape** — Escapes Svelte syntax characters (`{`, `}`) in code blocks
9. **Stringify** — Converts the AST to an HTML string

The plugin automatically processes any file ending with `.md` during Vite's build process.

## License

MIT
