import type { JSX, FunctionComponent, JSXNode } from "./types";
import { createTextNode, createElement, PUINode } from "./types";

export function renderJSX(
  tag: string | FunctionComponent | undefined,
  props: JSX.HTMLAttributes,
  _key?: string,
): JSX.Element {
  if (typeof tag === "function") {
    // handling Function Components
    return tag(props);
  } else if (tag === undefined || tag == "") {
    // handling <></>
    throw new TypeError(
      `Tag is required for rendering PUI JSX element. Fragments aren't supported yet`,
    );
  } else if (typeof tag == "string") {
    // handling plain HTML codes
    return renderTag(tag, props);
  } else {
    const err_msg = `Can't handle unknown tag type: ${typeof tag}\n${JSON.stringify(tag)}\n${JSON.stringify(props)}`;
    throw new TypeError(err_msg);
  }
}

export const renderFragment = renderJSX.bind(undefined, undefined);

function renderTag(tag: string, attributes: JSX.HTMLAttributes): JSX.Element {
  const { children, className } = attributes;
  delete attributes.children;
  const dataRefs = findState(attributes);
  if (className != null) {
    delete attributes.className;
    attributes["class"] = className;
  }
  // TODO: Handle children rendering
  return createElement(
    tag,
    dataRefs,
    attributes as any,
    renderChildren(children),
  );
}

function findState(attributes: JSX.HTMLAttributes) {
  const states: Record<string, JSX.Node> = {};
  for (const [key, val] of Object.entries(attributes)) {
    if (!(val instanceof PUINode)) {
      continue;
    }
    if (val.ntype != "state") {
      continue;
    }
    states[key] = val;
  }
  return states;
}

function renderChildren(children: JSXNode | Array<JSXNode>): Array<JSX.Node> {
  if (!children) {
    return [];
  }
  const rendered: Array<JSX.Node> = [];
  if (!Array.isArray(children)) {
    children = [children];
  }
  if (children.length == 0) {
    return children as Array<JSX.Node>;
  }
  for (const child of children) {
    switch (typeof child) {
      case "function":
        rendered.push(child());
        break;
      case "number":
      case "string":
      case "boolean":
      case "bigint":
        const node = createTextNode(String(child));
        rendered.push(node);
        break;
      case "object":
        if (child instanceof PUINode) {
          if (child.ntype == "custom") {
            console.error("Custom elements are not supported in JSX yet");
            continue;
          }
          rendered.push(child);
        } else if (Array.isArray(child)) {
          for (const c of renderChildren(child)) {
            rendered.push(c);
          }
        } else {
          console.warn("Unknown object type", child);
        }
        break;
      case "undefined":
        break;
      default:
        console.error(`Unsupported children type: ${typeof child}`, child);
        break;
    }
  }
  return rendered;
}
