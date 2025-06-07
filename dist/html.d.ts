declare module "src/html" {
    type objectType = "block" | "macro_opening_tag" | "raw_string" | "macro_closing_tag" | "template_string_return_value";
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
    type ClosingTag = {
        __type: objectType;
    };
    export type TemplateStringReturnValue = {
        toString: () => string;
    } & internalObject;
    type Block = {
        name: string;
        content: TemplateStringReturnValue;
    } & internalObject;
    class Macro<T = unknown> {
        templateFunction: (instance: Macro<T>) => TemplateStringReturnValue;
        props?: T;
        template: TemplateStringReturnValue;
        renderString: string;
        enclosing: {
            start: string;
            end: string;
        };
        hasBlocks: boolean;
        hasChildren: boolean;
        blocks: Map<string, TemplateStringReturnValue>;
        h: Helpers;
        constructor(templateFunction: (instance: Macro<T>) => TemplateStringReturnValue, props?: T);
        render(): RawString;
        open(): MacroOpeningTag<T>;
        close(): ClosingTag;
        html(strings: TemplateStringsArray, ...args: unknown[]): TemplateStringReturnValue;
    }
    export const macro: <T>(cb: (instance: Macro<T>) => TemplateStringReturnValue) => (props?: T) => Macro<T>;
    export const block: (name: string, content: TemplateStringReturnValue) => Block;
    export const raw: (value: string) => RawString;
    export const html: (strings: TemplateStringsArray, ...args: unknown[]) => TemplateStringReturnValue;
    export const close: () => {
        __type: string;
    };
}
declare module "mod" {
    export * from "src/html";
}
