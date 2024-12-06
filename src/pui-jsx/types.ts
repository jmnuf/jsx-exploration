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

export type PUINodeType = "custom" | "element" | "text" | "state";

export class PUINode {
  constructor(
    public ntype: PUINodeType,
    public tag: string,
    public attrs: PUINodeAttributes,
  ) {}
}
export function createTextNode(text: string): PUINode {
  return new PUINode("text", text, {});
}
export function createStateNode<T = unknown>(
  key: string,
  initValue: any,
): PUINode & { get value(): T; set value(v: T) } {
  const node = new PUINode("state", key, {
    value: initValue,
  });
  // TODO: Move to an actual class loser LOL
  Object.defineProperties(node, {
    value: {
      enumerable: true,
      configurable: false,
      get() {
        return node.attrs.value as unknown as T;
      },
      set(v: T) {
        node.attrs.value = v as any;
      },
    },
    [Symbol.toPrimitive]: {
      enumerable: false,
      writable: false,
      configurable: false,
      value(hint: "number" | "string" | "default") {
        if (hint == "string") {
          return String(node.attrs.value);
        }
        if (hint == "number") {
          return Number(node.attrs.value);
        }
        return node.attrs.value;
      },
    },
    valueOf: {
      enumerable: false,
      writable: false,
      configurable: false,
      value() {
        return node.attrs.value;
      },
    },
    toString: {
      enumerable: false,
      writable: false,
      configurable: false,
      value() {
        return String(node.attrs.value);
      },
    },
  });
  return node as any;
}

export class PUIElement extends PUINode {
  constructor(
    public data: Record<string, unknown>,
    public children: Array<PUINode>,
    tag: string,
    attrs: PUINodeAttributes,
  ) {
    super(tag.includes("-") ? "custom" : "element", tag, attrs);
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
