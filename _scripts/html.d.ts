declare module "src/html" {
    const helpers: {
        block: (name: string) => string;
        children: () => string;
    };
    type Helpers = typeof helpers;
    class ComponentOpeningTag<T = unknown> {
        instance: Component<T>;
        constructor(instance: Component<T>);
    }
    class ClosingTag {
    }
    class TemplateStringReturnValue {
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
    class Component<T = unknown> {
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
        open(props?: T): ComponentOpeningTag<T>;
        close(): ClosingTag;
        html(strings: TemplateStringsArray, ...args: unknown[]): TemplateStringReturnValue;
        with(props: T, callback: (component: Component<T>) => TemplateStringReturnValue): TemplateStringReturnValue;
    }
    export const component: <T>(cb: (helpers: Helpers, props?: T) => TemplateStringReturnValue) => Component<T>;
    export const raw: (str: string) => RawString;
    export const block: (name: string, content: TemplateStringReturnValue) => Block;
    export const html: (strings: TemplateStringsArray, ...args: unknown[]) => TemplateStringReturnValue;
}
declare module "mod" {
    export { block, component, html, raw } from "src/html";
}
