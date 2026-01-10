import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Plugin } from "vite";
import { rehypeEscapeSvelte } from "./plugins/rehypeEscapeSvelte";
import { remarkComponentToBlock } from "./plugins/remarkComponentToBlock";
import type { JanaOptions } from "./types/index";
import { usePlugins } from "./utils/index";

/**
 * Vite plugin that transforms Markdown files into HTML with Svelte-specific escaping.
 *
 * @example
 * ```ts
 * import { jana } from '@khotwa/jana'
 *
 * export default defineConfig({
 *   plugins: [jana()]
 * })
 * ```
 *
 * @param options - Configuration options for the plugin
 * @returns A Vite plugin instance
 */
export function jana(options: JanaOptions = {}): Plugin {
  const { plugins = {} } = options;

  const processor = unified()
    // 1. Markdown → mdast
    .use(remarkParse)
    .use(remarkComponentToBlock)
    .use(usePlugins(plugins.remark))

    // 2. mdast → hast
    .use(remarkRehype, { allowDangerousHtml: true })

    // 3. hast → HTML (Svelte-safe)
    .use(usePlugins(plugins.rehype))
    .use(rehypeEscapeSvelte)
    .use(rehypeStringify, { allowDangerousHtml: true });

  return {
    name: "jana",
    enforce: "pre",
    async transform(code, id) {
      if (!id.endsWith(".md")) return null;

      try {
        const result = await processor.process(code);

        return {
          code: result.toString(),
          map: null,
        };
      } catch (error: unknown) {
        console.error(`Failed to process Markdown file "${id}":`, error);
        return null;
      }
    },
  };
}
