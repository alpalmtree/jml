declare const helpers: {
    block: (name: string) => string;
    children: () => string;
};
type Helpers = typeof helpers;
declare class ComponentOpeningTag<T = unknown> {
    instance: Component<T>;
    constructor(instance: Component<T>);
}
declare class ClosingTag {
}
declare class TemplateStringReturnValue {
    string: string;
    constructor(string: string);
}
declare class RawString {
    value: string;
    constructor(value: string);
}
declare class Block {
    name: string;
    content: TemplateStringReturnValue;
    constructor(name: string, content: TemplateStringReturnValue);
}
declare class Component<T = unknown> {
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
export declare const component: <T>(cb: (helpers: Helpers, props?: T) => TemplateStringReturnValue) => Component<T>;
export declare const raw: (str: string) => RawString;
export declare const block: (name: string, content: TemplateStringReturnValue) => Block;
export declare const html: (strings: TemplateStringsArray, ...args: unknown[]) => TemplateStringReturnValue;
export {};
