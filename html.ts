import { escape } from "jsr:@std/html";
const helpers = {
  block: (name: string): string => {
    return `@__block:${name}`;
  },

  children: () => {
    return "@__children";
  },
};
type Helpers = typeof helpers;

class ComponentOpeningTag<T = unknown> {
  constructor(
    public instance: Component<T>,
  ) {}
}

class ClosingTag {}

class TemplateStringReturnValue {
  constructor(
    public string: string,
  ) {}
}


class Component<T = unknown> {
  public template: string;
  public renderString: string = "";
  public enclosing = {
    start: "",
    end: "",
  };

  public hasBlocks = false;
  public hasChildren = false;

  public blocks = new Map<string, string>();

  public helpers: Helpers = {
    block: (name: string): string => {
      this.hasBlocks = true;
      this.blocks.set(name, "");
      return `@__block:${name}`;
    },
    children: () => {
      this.hasChildren = true;
      return "@__children";
    },
  };

  constructor(
    public templateFunction: (
      helpers: Helpers,
      props?: T,
    ) => TemplateStringReturnValue,
    private props?: T,
  ) {
    this.template = this.templateFunction(this.helpers, this.props).string;
  }

  public render(props?: T) {
    const instance = new Component(this.templateFunction, props);
    return raw(instance.template);
  }

  public open(props?: T) {
    const instance = new Component(this.templateFunction, props);

    if (this.hasChildren) {
      const splitted = instance.template.split("@__children");
      instance.enclosing.start = splitted.at(0)!;
      instance.enclosing.end = splitted.at(-1)!;
    }
    return new ComponentOpeningTag(instance);
  }
  public close() {
    return new ClosingTag()
  }
}

export const component = <T>(
  cb: (helpers: Helpers, props?: T) => TemplateStringReturnValue,
) => {
  return new Component<T>(cb, undefined);
};

class RawString {
  constructor(
    public value: string,
  ) {}
}

class Block {
  constructor(
    public name: string,
    public content: TemplateStringReturnValue,
  ) {}
}


export const raw = (str: string) => new RawString(str);
export const block = (name: string, content: TemplateStringReturnValue) =>
  new Block(name, content);

const transform = (
  arg: unknown,
  internals: { currentComponent: Component | null },
): string => {
  if (arg instanceof ComponentOpeningTag) {
    internals.currentComponent = arg.instance;
    return internals.currentComponent.hasChildren
      ? internals.currentComponent.enclosing.start
      : "";
  }

  if (arg instanceof Block) {
    if (!internals.currentComponent) {
      console.error("Cannot use block without opening component");
      Deno.exit();
    }
    internals.currentComponent.blocks.set(arg.name, arg.content.string);
    return "";
  }

  if (arg instanceof ClosingTag) {
    if (internals.currentComponent && internals.currentComponent.hasChildren) {
      return internals.currentComponent?.enclosing.end;
    }

    const blocks = internals.currentComponent!.blocks;
    const template = internals.currentComponent!.template;
    let componentString = template;
    for (const [key, value] of blocks?.entries()) {
      componentString = componentString.replace(`@__block:${key}`, value);
    }

    internals.currentComponent = null;
    return componentString;
  }

  if (arg instanceof TemplateStringReturnValue) return arg.string;
  if (typeof arg === "string") return escape(arg);
  if (arg instanceof RawString) return arg.value;
  if (Array.isArray(arg)) return arg.join("");

  return arg as string;
};

export const html = (
  strings: TemplateStringsArray,
  ...args: unknown[]
): TemplateStringReturnValue => {
  const internals: { currentComponent: Component | null } = {
    currentComponent: null,
  };
  let final: string = "";
  for (const [index, string] of strings.entries()) {
    const currentArg = args[index] ?? "";
    const transformedValue = transform(currentArg, internals);
    const currentString = string + transformedValue;

    final += currentString;
  }

  return new TemplateStringReturnValue(final);
};
