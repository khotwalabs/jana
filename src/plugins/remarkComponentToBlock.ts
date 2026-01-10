import type { Root, Paragraph, Html } from "mdast";
import type { Parent } from "unist";
import { visit } from "unist-util-visit";

export function remarkComponentToBlock() {
  return (tree: Root) => {
    visit(tree, "paragraph", (node: Paragraph, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index == null) return;
      if (node.children.length !== 1) return;

      const child = node.children[0];
      if (child.type !== "html") return;

      const htmlChild = child as Html;
      const componentTagPattern = /^<\s*[A-Z][\w-]*(?:\s+[^>]*)?\s*\/?>/;
      if (!componentTagPattern.test(htmlChild.value)) return;

      parent.children[index] = htmlChild;
    });
  };
}
