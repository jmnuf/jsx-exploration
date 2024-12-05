import type { JSX, FunctionComponent } from "./types";
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
    return renderTag(tag, props, renderChildren(props));
  } else {
    const err_msg = `Can't handle unknown tag type: ${typeof tag}\n${JSON.stringify(tag)}\n${JSON.stringify(props)}`;
    throw new TypeError(err_msg);
  }
}

export const renderFragment = renderJSX.bind(undefined, undefined);

function renderTag(
  tag: string,
  attributes: JSX.HTMLAttributes,
  children: Array<JSX.Node>,
): JSX.Element {
  // TODO: Handle attributes and extract data
  const dataRefs = {};
  // TODO: Handle children rendering
  return createElement(tag, dataRefs, attributes as any, children);
}

function renderChildren(attributes: JSX.HTMLAttributes): Array<JSX.Node> {
  let children = attributes?.children;
  if (!children) {
    return [];
  }
  const rendered: Array<JSX.Node> = [];
  if (!Array.isArray(children)) {
    children = [children];
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
          rendered.push(child);
        } else if (Array.isArray(child)) {
          for (const c of renderChildren({ children: child })) {
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
