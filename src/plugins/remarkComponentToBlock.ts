import { visit } from "unist-util-visit";

export function remarkComponentToBlock() {
  return (tree: any) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index == null) return;
      if (node.children.length !== 1) return;

      const child = node.children[0];
      if (child.type !== "html") return;

      const componentTagPattern = /^<[A-Z][\w-]*(?:\s+[^>]*)?\/?>/;
      if (!componentTagPattern.test(child.value)) return;

      parent.children[index] = child;
    });
  };
}
