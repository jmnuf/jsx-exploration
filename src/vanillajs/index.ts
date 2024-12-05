import type { FunctionComponent, RenderedNode } from "./jsx-runtime";
export type { JSXChildren } from "./jsx-runtime";

export function render(
  parent: HTMLElement,
  Component: FunctionComponent<{ children: Array<RenderedNode> }>,
) {
  const children: RenderedNode[] = [...parent.children];
  for (const child of children) {
    parent.removeChild(child);
  }
  const element = Component({ children });
  parent.appendChild(element);
}
