import type { PUIElement, BaseCompProps, FunctionComponent } from "./types";
import { createStateNode, PUINode } from "./types";

export type FC<T extends BaseCompProps = BaseCompProps> = FunctionComponent<T>;

export function modelData<T>(value: T) {
  const stateNode = createStateNode<T>("", value);
  const getValue = () => stateNode as unknown as T & { value: T };
  // const setValue = (value: T): void => (stateNode.attrs.value = value as any);
  const setValue = (valOrSetter: T | ((v: T) => T)) => {
    if (typeof valOrSetter == "function") {
      stateNode.attrs.value = (valOrSetter as (v: T) => T)(
        stateNode.attrs.value as any,
      ) as any;
      return;
    }
    stateNode.attrs.value = valOrSetter as any;
  };
  return [getValue, setValue] as const;
}

const createMarker = (child_idx: number, idxs: Array<number>) => {
  return (s: string) =>
    s.length == 0 ? `__child_${idxs.join("_")}_${child_idx}__` : `__child_${idxs.join("_")}_${child_idx}_${s}__`;
}

export function genModel(
  elem: PUIElement,
): Record<string, any> & { template: string } {
  const { tag, attrs, data } = elem;
  let template = `<${tag}`;
  const attrsEntries = Object.entries(attrs).filter(
    ([key, _]) => key != "children",
  );
  if (attrsEntries.length > 0) {
    template += " ";
    template += renderAttributesTemplate(elem, data, attrsEntries);
  }
  template += ">";
  let child_idx = -1;
  for (const child of elem.children) {
    child_idx += 1;
    if (child.ntype == "text") {
      template += child.tag;
      continue;
    }
    const mark = createMarker(child_idx, [child_idx]);
    const childId = mark("");
    if (child.ntype == "custom") {
      const model = genModel(child as PUIElement);
      data[childId] = model;
      template += `<\${ ${childId} === }>`;
      continue;
    }
    if (child.ntype == "state") {
      Object.defineProperty(data, childId, {
        enumerable: true,
        configurable: false,
        get() {
          return child.attrs.value;
        },
        set(v: any) {
          child.attrs.value = v;
        },
      });
      template += `\${ ${childId} }`;
      continue;
    }
    if (child.ntype == "element") {
      const subelem = child as PUIElement;
      let subtemplate = `<${subelem.tag}`;
      const subattrs = Object.entries(subelem.attrs).filter(([key, _]) => key != "children");
      if (subattrs.length > 0) {
        subtemplate += " ";
        subtemplate += renderAttributesTemplate(subelem, data, subattrs);
      }
      subtemplate += ">";
      subtemplate += renderChildrenTemplate([child_idx], subelem, data, elem);
      subtemplate += `</${subelem.tag}>`;
      template += subtemplate;
    }
  }
  template += `</${tag}>`;
  data.template = template;
  return data as any;
}

function renderAttributesTemplate(_elem: PUIElement, data: any, attrs: Array<[string, any]>) {
  let template = "";
  for (const [key, val] of attrs) {
    if (key == "children") {
      continue;
    }
    if (key.startsWith("on")) {
      if (typeof val != "function") {
        console.error("Expected function for property " + key);
        continue;
      }
      let eventName = key.substring(2);
      eventName = `${eventName[0].toLowerCase()}${eventName.substring(1)}`;
      template += ` \${ ${eventName} @=> ${key} }`;
      data[key] = val as (ev: Event) => void;
      continue;
    }
    if (typeof val == "object") {
      console.error(
        "Objects not supported as properties, if you're using states it's not supported yet",
      );
      continue;
    }
    if (typeof val == "function") {
      console.warn(
        `Setting property ${key} as event handler but not using 'on' prefix makes it unclear. It's recommended to use 'on' prefix for events`,
      );
      template += ` \${ ${key} @=> ${key} }`;
      data[key] = val;
      continue;
    }
    template += ` ${key}="${val}"`;
  }
  return template;
}

function renderChildrenTemplate(idxs: Array<number>, elem: PUIElement, data: any, parent: PUIElement) {
  let template = '';
  let child_idx = -1;
  for (const child of elem.children) {
    child_idx += 1;
    if (child.ntype == "text") {
      template += child.tag;
      continue;
    }
    const mark = createMarker(child_idx, idxs);
    const childId = mark("");
    if (child.ntype == "custom") {
      const model = genModel(child as PUIElement);
      data[childId] = model;
      template += `<\${ ${childId} === } />`;
      continue;
    }
    if (child.ntype == "state") {
      Object.defineProperty(data, childId, {
        enumerable: true,
        configurable: false,
        get() {
          return child.attrs.value;
        },
        set(v: any) {
          child.attrs.value = v;
        },
      });
      template += `\${ ${childId} }`;
      continue;
    }
    if (child.ntype == "element") {
      const subelem = child as PUIElement;
      let subtemplate = `<${subelem.tag}`;
      for (const [sk, v] of Object.entries(subelem.attrs)) {
        if (v instanceof PUINode) {
          console.error("Unexpected JSX.Node");
          continue;
        }
        if (typeof v != "function") {
          // TODO: Not sure how to handle non-event attributes yet
          subtemplate += ` ${sk}="${v}"`;
          continue;
        }
        const key = mark(sk);
        data[key] = v;
        if (sk.startsWith("on")) {
          let eventName = sk.substring(2);
          eventName = `${eventName[0].toLowerCase()}${eventName.substring(1)}`;
          subtemplate += ` \${ ${eventName} @=> ${key} }`;
        } else {
          subtemplate += ` \${ ${sk} @=> ${key} }`;
        }
      }
      if (subelem.children.length == 0) {
        subtemplate += " />";
      } else {
        subtemplate += ">";
        subtemplate += renderChildrenTemplate([...idxs, child_idx], subelem, data, parent);
        subtemplate += `</${subelem.tag}>`;
      }
      template += subtemplate;
    }
  }
  return template;
}

export function renderHTML(elem: PUIElement): string {
  return renderChildHTML("", elem);
}

function renderChildHTML(id: string, elem: PUIElement): string {
  const { tag, attrs } = elem;
  const is_custom = elem.ntype == "custom";
  let template = `<${tag}`;
  if (id.length > 0 && is_custom) {
    template += ` \${ ${id} === }`;
  }
  const attrsEntries = Object.entries(attrs).filter(
    ([key, _]) => key != "children",
  );
  // console.log(attrsEntries);
  if (attrsEntries.length > 0) {
    template += " ";
    const eventsData = {} as Record<string, (event: Event) => void>;
    for (const [key, val] of attrsEntries) {
      if (key.startsWith("on")) {
        if (typeof val != "function") {
          console.error("Expected function for property " + key);
          continue;
        }
        let eventName = key.substring(2);
        eventName = `${eventName[0].toLowerCase()}${eventName.substring(1)}`;
        template += ` \${ ${eventName} @=> ${key} }`;
        eventsData[key] = val as (ev: Event) => void;
        continue;
      }
      if (typeof val == "object") {
        console.error(
          "Objects not supported as properties, if you're using states it's not supported yet",
        );
        continue;
      }
      if (typeof val == "function") {
        console.warn(
          `Setting property ${key} as event handler but not using 'on' prefix makes it unclear. It's recommended to use 'on' prefix for events`,
        );
        template += ` \${ ${key} @=> ${key} }`;
        eventsData[key] = val;
        continue;
      }
      template += ` ${key}="${val}"`;
    }
  }
  template += ">";
  let child_idx = -1;
  for (const child of elem.children) {
    child_idx += 1;
    const childId = is_custom ? `${id}child_${child_idx}__` : id;
    if (child.ntype == "text") {
      template += child.tag;
      continue;
    }
    if (child.ntype == "state") {
      template += `\${ ${childId} }`;
      continue;
    }
    if (child.ntype == "element") {
      template += renderChildHTML(childId, child as any);
    }
  }
  template += `</${tag}>`;
  return template;
}

export function renderDOM<T>(
  UI: {
    create: (
      parent: HTMLElement,
      model: Record<string, any>,
      template: string,
    ) => T;
  },
  parent: HTMLElement,
  Component: FunctionComponent,
) {
  const model = genModel(Component({ children: [] }));
  return UI.create(parent, model, model.template);
}
