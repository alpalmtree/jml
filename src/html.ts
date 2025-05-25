//@ts-ignore tsc won't find this
import { escape } from "jsr:@std/html";

type Helpers = {
    block: (name: string) => string;
    children: () => string;
};

class ComponentOpeningTag<T = unknown> {
  constructor(
    public instance: Component<T>,
  ) {}
}

class ClosingTag {}

export class TemplateStringReturnValue {
  constructor(
    public string: string,
  ) {}
}

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
      return "";
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
    blocks.forEach((value, key) => {
      componentString = componentString.replace(`@__block:${key}`, value);
    });

    internals.currentComponent = null;
    return componentString;
  }

  if (arg instanceof TemplateStringReturnValue) return arg.string;
  if (typeof arg === "string") return escape(arg);
  if (arg instanceof RawString) return arg.value;
  if (Array.isArray(arg)) return arg.join("");

  return arg as string;
};

const TemplateStringBuilder = (
  strings: TemplateStringsArray,
  ...args: unknown[]
): TemplateStringReturnValue => {
  const internals: { currentComponent: Component | null } = {
    currentComponent: null,
  };

  let final: string = "";
  // Much faster than any other method
  for (let index = 0; index < strings.length; index++) {
    const currentArg = args[index] ?? "";
    const transformedValue = transform(currentArg, internals);
    const currentString = strings[index] + transformedValue;

    final += currentString;
  }

  return new TemplateStringReturnValue(final);
};

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
    const instance = this.props
      ? this
      : new Component(this.templateFunction, props);

    if (this.hasChildren) {
      const splitted = instance.template.split("@__children");
      instance.enclosing.start = splitted.at(0)!;
      instance.enclosing.end = splitted.at(-1)!;
    }
    return new ComponentOpeningTag(instance);
  }
  public close() {
    return new ClosingTag();
  }

  public html(strings: TemplateStringsArray, ...args: unknown[]) {
    const _strings = ["", ...strings, ""] as unknown as TemplateStringsArray;
    const _args = [this.open(), ...args, this.close()];
    return TemplateStringBuilder(_strings, ..._args);
  }

  public with(
    props: T,
    callback: (component: Component<T>) => TemplateStringReturnValue,
  ) {
    const instance = new Component(this.templateFunction, props);
    return callback(instance);
  }
}

export const component = <T>(
  cb: (helpers: Helpers, props?: T) => TemplateStringReturnValue,
) => {
  return new Component<T>(cb, undefined);
};

export const raw = (str: string) => new RawString(str);
export const block = (name: string, content: TemplateStringReturnValue) =>
  new Block(name, content);

export const html = (
  strings: TemplateStringsArray,
  ...args: unknown[]
): TemplateStringReturnValue => {
  return TemplateStringBuilder(strings, ...args);
};
