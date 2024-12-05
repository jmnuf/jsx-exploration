// Set the attributes to allow any keys and very permissive values
export type HTMLAttributes = Record<string, JSXNode | undefined> & JSXChildren;

namespace JSX {
  export type IntrinsicElements = Record<string, HTMLAttributes>;

  // Declare the shape of JSX rendering result
  // This is required so the return types of components can be inferred
  export type Element = PUIElement;
  export type Node = PUINode;

  export type HTMLAttributes = Record<string, JSXNode | undefined> &
    PUINodeAttributes &
    JSXChildren;
}

export type { JSX };

type JSXChildren = {
  children?: JSXNode | JSXNode[] | undefined;
};

export type JSXNode =
  | PUINode
  | PUIElement
  | (() => JSX.Node)
  | boolean
  | number
  | bigint
  | string
  | null
  | undefined;

export type BaseCompProps = Record<string, unknown> & JSXChildren;

export type FunctionComponent<TProps extends BaseCompProps = BaseCompProps> = (
  props: TProps,
) => JSX.Element;

export type PUINodeAttributes = Record<
  string,
  object | string | number | ((event: Event) => void)
>;

export type PUINodeType = "element" | "text";

export class PUINode {
  constructor(
    public ntype: PUINodeType,
    public tag: string,
    public attrs: PUINodeAttributes,
  ) {}
}
export function createTextNode(text: string) {
  return new PUINode("text", text, {});
}
export class PUIElement extends PUINode {
  constructor(
    public data: Record<string, unknown>,
    public children: Array<PUINode>,
    tag: string,
    attrs: PUINodeAttributes,
  ) {
    super("element", tag, attrs);
  }
}
export function createElement(
  tag: string,
  data: Record<string, unknown>,
  attrs: PUINodeAttributes = {},
  children: Array<PUINode> = [],
) {
  return new PUIElement(data, children, tag, attrs);
}
