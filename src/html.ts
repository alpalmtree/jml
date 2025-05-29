//@ts-ignore tsc cannot recognize this type of imports
import { escape } from "jsr:@std/html";

type Helpers = {
  block: (name: string) => string;
  children: () => string;
};

class MacroOpeningTag<T = unknown> {
  constructor(
    public instance: Macro<T>,
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
  internals: { currentMacro: Macro | null },
): string => {
  if (arg instanceof MacroOpeningTag) {
    internals.currentMacro = arg.instance;
    return internals.currentMacro.hasChildren
      ? internals.currentMacro.enclosing.start
      : "";
  }

  if (arg instanceof Block) {
    if (!internals.currentMacro) {
      console.error("Cannot use block without opening macro");
      return "";
    }
    internals.currentMacro.blocks.set(arg.name, arg.content.string);
    return "";
  }

  if (arg instanceof ClosingTag) {
    if (internals.currentMacro && internals.currentMacro.hasChildren) {
      return internals.currentMacro?.enclosing.end;
    }

    const blocks = internals.currentMacro!.blocks;
    const template = internals.currentMacro!.template;
    let macroString = template;
    blocks.forEach((value, key) => {
      macroString = macroString.replace(`@__block:${key}`, value);
    });

    internals.currentMacro = null;
    return macroString;
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
  const internals: { currentMacro: Macro | null } = {
    currentMacro: null,
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

class Macro<T = unknown> {
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
    const instance = new Macro(this.templateFunction, props);
    return raw(instance.template);
  }

  public open(props?: T) {
    const instance = this.props
      ? this
      : new Macro(this.templateFunction, props);

    if (this.hasChildren) {
      const splitted = instance.template.split("@__children");
      instance.enclosing.start = splitted.at(0)!;
      instance.enclosing.end = splitted.at(-1)!;
    }
    return new MacroOpeningTag(instance);
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
    callback: (macro: Macro<T>) => TemplateStringReturnValue,
  ) {
    const instance = new Macro(this.templateFunction, props);
    return callback(instance);
  }
}

export const macro = <T>(
  cb: (helpers: Helpers, props?: T) => TemplateStringReturnValue,
) => {
  return new Macro<T>(cb, undefined);
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
