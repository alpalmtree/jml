declare module "src/html" {
    type Helpers = {
        block: (name: string) => string;
        children: () => string;
    };
    class MacroOpeningTag<T = unknown> {
        instance: Macro<T>;
        constructor(instance: Macro<T>);
    }
    class ClosingTag {
    }
    export class TemplateStringReturnValue {
        string: string;
        constructor(string: string);
    }
    class RawString {
        value: string;
        constructor(value: string);
    }
    class Block {
        name: string;
        content: TemplateStringReturnValue;
        constructor(name: string, content: TemplateStringReturnValue);
    }
    class Macro<T = unknown> {
        templateFunction: (helpers: Helpers, props?: T) => TemplateStringReturnValue;
        private props?;
        template: string;
        renderString: string;
        enclosing: {
            start: string;
            end: string;
        };
        hasBlocks: boolean;
        hasChildren: boolean;
        blocks: Map<string, string>;
        helpers: Helpers;
        constructor(templateFunction: (helpers: Helpers, props?: T) => TemplateStringReturnValue, props?: T);
        render(props?: T): RawString;
        open(props?: T): MacroOpeningTag<T>;
        close(): ClosingTag;
        html(strings: TemplateStringsArray, ...args: unknown[]): TemplateStringReturnValue;
        with(props: T, callback: (macro: Macro<T>) => TemplateStringReturnValue): TemplateStringReturnValue;
    }
    export const macro: <T>(cb: (helpers: Helpers, props?: T) => TemplateStringReturnValue) => Macro<T>;
    export const raw: (str: string) => RawString;
    export const block: (name: string, content: TemplateStringReturnValue) => Block;
    export const html: (strings: TemplateStringsArray, ...args: unknown[]) => TemplateStringReturnValue;
}
declare module "mod" {
    export * from "src/html";
}
