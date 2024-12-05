import type { JSX, FunctionComponent } from "./types.d.ts";

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
    const frag = document.createDocumentFragment();
    for (const child of renderChildren(props ?? {})) {
      frag.append(child);
    }
    return frag;
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
  children: Array<Node>,
): HTMLElement {
  const elem = document.createElement(tag);
  handleAttributes(elem, attributes);
  elem.append(...children);
  return elem;
}

function handleAttributes(elem: HTMLElement, attrs: JSX.HTMLAttributes) {
  for (const [pname, pdata] of Object.entries(attrs)) {
    if (pname == "children") {
      continue;
    }
    if (pname.startsWith("on")) {
      const eventName = pname.substring(2).toLowerCase();
      if (typeof pdata != "function") {
        console.error(
          "Invalid value passed to on event attribute, expected a function",
        );
        continue;
      }
      elem.addEventListener(eventName, pdata);
      continue;
    }
    if (pname == "className") {
      elem.setAttribute("class", `${pdata}`);
      continue;
    }
    elem.setAttribute(pname, `${pdata}`);
  }
}
function renderChildren(attributes: JSX.HTMLAttributes): Array<Node> {
  let children = attributes?.children;
  if (!children) {
    return [];
  }
  const rendered: Array<Node> = [];
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
        rendered.push(document.createTextNode(String(child)));
        break;
      case "object":
        if (child instanceof Node) {
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
