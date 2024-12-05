// Set the attributes to allow any keys and very permissive values
export type HTMLAttributes = Record<string, JSXNode | undefined> & JSXChildren;

namespace JSX {
  export type IntrinsicElements = Record<string, HTMLAttributes>;

  // Declare the shape of JSX rendering result
  // This is required so the return types of components can be inferred
  export type Element = RenderedNode;

  export type HTMLAttributes = Record<string, JSXNode | undefined> &
    JSXChildren;
}

export type { JSX };

export type RenderedNode = Node;

export interface JSXChildren {
  children?: JSXNode | JSXNode[] | undefined;
}

export type JSXNode =
  | RenderedNode
  // | RawContentNode
  | (() => Node)
  | boolean
  | number
  | bigint
  | string
  | null
  | undefined;

export type FunctionComponent<TProps extends Record<string, unknown> = {}> = (
  props: TProps,
) => JSX.Element;
