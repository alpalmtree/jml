//@ts-ignore tsc cannot recognize this type of imports
import { escape } from "jsr:@std/html";

type objectType = "block" | "macro_opening_tag" | "macro_closing_tag" | "raw_string" | "template_string_return_value"
type internalObject = {
  __type: objectType
}

type Helpers = {
  block: (name: string) => string;
  children: () => string;
};

type MacroOpeningTag<T = unknown> = {
  instance: Macro<T>;
} & internalObject;

type ClosingTag = { __type: objectType };

export type TemplateStringReturnValue = {
  string: string;
} & internalObject;

type RawString = {
  value: string;
} & internalObject;

type Block = {
  name: string;
  content: TemplateStringReturnValue;
} & internalObject;

const transform = (
  arg: unknown,
  internals: { currentMacro: Macro | null },
): string => {
  if (arg && typeof arg === "object" && "__type" in arg) {
    if ((arg as internalObject).__type === "macro_opening_tag") {
      internals.currentMacro = (arg as MacroOpeningTag).instance;
      return internals.currentMacro.hasChildren
        ? internals.currentMacro.enclosing.start
        : "";
    }

    if ((arg as internalObject).__type === "block") {
      if (!internals.currentMacro) {
        console.error("Cannot use block without opening macro");
        return "";
      }
      internals.currentMacro.blocks.set(
        (arg as Block).name,
        (arg as Block).content.string,
      );
      return "";
    }

    if ((arg as internalObject).__type === "macro_closing_tag") {
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

    if (
      (arg as internalObject).__type === "template_string_return_value"
    ) return (arg as TemplateStringReturnValue).string;
    if ((arg as internalObject).__type === "raw_string") {
      return (arg as RawString).value;
    }
  }

  if (typeof arg === "string") return escape(arg);

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

  return { string: final, __type: "template_string_return_value" };
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

  public open(props?: T): MacroOpeningTag<T> {
    const instance = this.props
      ? this
      : new Macro(this.templateFunction, props);

    if (this.hasChildren) {
      const splitted = instance.template.split("@__children");
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

export const raw = (value: string): RawString => ({
  value,
  __type: "raw_string"
});
export const block = (
  name: string,
  content: TemplateStringReturnValue,
): Block => ({ name, content, __type: "block" });

export const html = (
  strings: TemplateStringsArray,
  ...args: unknown[]
): TemplateStringReturnValue => {
  return TemplateStringBuilder(strings, ...args);
};
