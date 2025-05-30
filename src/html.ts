//@ts-ignore tsc cannot recognize this type of imports
import { escape } from "jsr:@std/html";

type objectType =
  | "block"
  | "macro_opening_tag"
  | "raw_string"
  | "macro_closing_tag"
  | "template_string_return_value";
type internalObject = {
  __type: objectType;
};

type Helpers = {
  block: (name: string) => null | TemplateStringReturnValue;
  children: () => string;
};

type MacroOpeningTag<T = unknown> = {
  instance: Macro<T>;
} & internalObject;

type RawString = {
  value: string;
} & internalObject;

type ClosingTag = { __type: objectType };

export type TemplateStringReturnValue = {
  toString: () => string;
} & internalObject;

type Block = {
  name: string;
  content: TemplateStringReturnValue;
} & internalObject;

const transform = (
  arg: unknown,
  internals: { currentMacro: Macro | null },
): string => {
  if (typeof arg === "string") return escape(arg);
  if (Array.isArray(arg)) return arg.join("");

  if (arg && typeof arg === "object" && "__type" in arg) {
    if (arg.__type === "macro_opening_tag") {
      internals.currentMacro = (arg as MacroOpeningTag).instance;
      return internals.currentMacro.hasChildren
        ? internals.currentMacro.enclosing.start
        : "";
    }

    if (arg.__type === "block") {
      if (!internals.currentMacro) {
        console.error("Cannot use block without opening macro");
        return "";
      }
      internals.currentMacro.blocks.set(
        (arg as Block).name,
        (arg as Block).content,
      );
      return "";
    }

    if (arg.__type === "macro_closing_tag") {
      if (internals.currentMacro && internals.currentMacro.hasChildren) {
        return internals.currentMacro?.enclosing.end;
      }

      const template = internals.currentMacro!.templateFunction(
        internals.currentMacro!.helpers,
        internals.currentMacro!.props,
      ).toString();

      internals.currentMacro = null;
      return template;
    }
    if (
      arg.__type === "raw_string"
    ) return (arg as RawString).value;
    if (
      arg.__type === "template_string_return_value"
    ) return (arg as TemplateStringReturnValue).toString();
  }

  return arg as string;
};

const TemplateStringBuilder = (
  strings: TemplateStringsArray,
  ...args: unknown[]
): TemplateStringReturnValue => {
  const internals: { currentMacro: Macro | null } = {
    currentMacro: null,
  };

  return {
    toString: () => {
      let final: string = "";
      for (let index = 0; index < strings.length; index++) {
        const currentArg = args[index] ?? "";
        const transformedValue = transform(currentArg, internals);
        const currentString = strings[index] + transformedValue;

        final += currentString;
      }
      return final;
    },
    __type: "template_string_return_value",
  };
};

class Macro<T = unknown> {
  public template: TemplateStringReturnValue;
  public renderString: string = "";
  public enclosing = {
    start: "",
    end: "",
  };

  public hasBlocks = false;
  public hasChildren = false;

  public blocks = new Map<string, TemplateStringReturnValue>();

  public helpers: Helpers = {
    block: (name: string): null | TemplateStringReturnValue => {
      this.hasBlocks = true;
      return this.blocks.get(name) ?? null;
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
    public props?: T,
  ) {
    this.template = this.templateFunction(this.helpers, this.props);
  }

  public render(props?: T) {
    const instance = new Macro(this.templateFunction, props);
    return raw(instance.template.toString());
  }

  public open(props?: T): MacroOpeningTag<T> {
    const instance = this.props
      ? this
      : new Macro(this.templateFunction, props);

    if (this.hasChildren) {
      const splitted = instance.template.toString().split("@__children");
      instance.enclosing.start = splitted.at(0)!;
      instance.enclosing.end = splitted.at(-1)!;
    }
    return { instance, __type: "macro_opening_tag" };
  }
  public close(): ClosingTag {
    return { __type: "macro_closing_tag" };
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

export const block = (
  name: string,
  content: TemplateStringReturnValue,
): Block => ({ name, content, __type: "block" });

export const raw = (value: string): RawString => ({
  value,
  __type: "raw_string",
});

export const html = (
  strings: TemplateStringsArray,
  ...args: unknown[]
): TemplateStringReturnValue => {
  return TemplateStringBuilder(strings, ...args);
};
