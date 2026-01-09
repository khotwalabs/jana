import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Plugin } from "vite";
import { rehypeEscapeSvelte } from "./plugins/rehypeEscapeSvelte.js";

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeEscapeSvelte)
  .use(rehypeStringify, { allowDangerousHtml: true });

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
 * @returns A Vite plugin instance
 */
export function jana(): Plugin {
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
