import type { PUIElement, BaseCompProps, FunctionComponent } from "./types";

export type FC<T extends BaseCompProps = BaseCompProps> = FunctionComponent<T>;

export function genModel(
  elem: PUIElement,
): Record<string, any> & { template: string } {
  const { tag, attrs, data } = elem;
  let template = `<${tag}`;
  const eventsData = {} as Record<string, (event: Event) => void>;
  const attrsEntries = Object.entries(attrs).filter(
    ([key, _]) => key != "children",
  );
  if (attrsEntries.length > 0) {
    template += " ";
    for (const [key, val] of attrsEntries) {
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
    if (child.ntype == "text") {
      template += child.tag;
      continue;
    }
    if (child.ntype == "element") {
      const childId = `__child_${child_idx}__`;
      // template += `<\${ ${childId} === }>`;
      const model = genModel(child as any);
      data[childId] = model;
      template += model.template;
    }
  }
  template += `</${tag}>`;
  return {
    ...data,
    ...eventsData,
    template,
  };
}

export function renderHTML(elem: PUIElement): string {
  return renderChildHTML("", elem);
}

function renderChildHTML(id: string, elem: PUIElement): string {
  const { tag, attrs, data } = elem;
  void data;
  let template = `<${tag}`;
  if (id.length > 0) {
    template += ` \${ ${id} === }`;
  }
  const attrsEntries = Object.entries(attrs).filter(
    ([key, _]) => key != "children",
  );
  console.log(attrsEntries);
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
    if (child.ntype == "text") {
      template += child.tag;
      continue;
    }
    if (child.ntype == "element") {
      // const childId = `__child_${child_idx}__`;
      template += renderChildHTML("", child as any);
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
