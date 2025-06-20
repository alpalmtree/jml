const rawToEntityEntries = [
    [
        "&",
        "&amp;"
    ],
    [
        "<",
        "&lt;"
    ],
    [
        ">",
        "&gt;"
    ],
    [
        '"',
        "&quot;"
    ],
    [
        "'",
        "&#39;"
    ]
];
Object.fromEntries([
    ...rawToEntityEntries.map(([raw, entity])=>[
            entity,
            raw
        ]),
    [
        "&apos;",
        "'"
    ],
    [
        "&nbsp;",
        "\xa0"
    ]
]);
const rawToEntity = new Map(rawToEntityEntries);
const rawRe = new RegExp(`[${[
    ...rawToEntity.keys()
].join("")}]`, "g");
function escape(str) {
    return str.replaceAll(rawRe, (m)=>rawToEntity.get(m));
}
new WeakMap();
const transform = (arg, internals)=>{
    if (typeof arg === "string") return escape(arg);
    if (Array.isArray(arg)) return arg.join("");
    if (arg && typeof arg === "object" && "__type" in arg) {
        if (arg.__type === "macro_opening_tag") {
            internals.currentMacro = arg.instance;
            return internals.currentMacro.hasChildren ? internals.currentMacro.enclosing.start : "";
        }
        if (arg.__type === "block") {
            if (!internals.currentMacro) {
                console.error("Cannot use block without opening macro");
                return "";
            }
            internals.currentMacro.blocks.set(arg.name, arg.content);
            return "";
        }
        if (arg.__type === "macro_closing_tag") {
            if (internals.currentMacro && internals.currentMacro.hasChildren) {
                return internals.currentMacro?.enclosing.end;
            }
            const template = internals.currentMacro.templateFunction(internals.currentMacro).toString();
            internals.currentMacro = null;
            return template;
        }
        if (arg.__type === "raw_string") return arg.value;
        if (arg.__type === "template_string_return_value") return arg.toString();
    }
    return arg;
};
const TemplateStringBuilder = (strings, ...args)=>{
    const internals = {
        currentMacro: null
    };
    return {
        toString: ()=>{
            let __final = "";
            for(let index = 0; index < strings.length; index++){
                const currentArg = args[index] ?? "";
                const transformedValue = transform(currentArg, internals);
                const currentString = strings[index] + transformedValue;
                __final += currentString;
            }
            return __final;
        },
        __type: "template_string_return_value"
    };
};
class Macro {
    templateFunction;
    props;
    template;
    renderString;
    enclosing;
    hasBlocks;
    hasChildren;
    blocks;
    h;
    constructor(templateFunction, props){
        this.templateFunction = templateFunction;
        this.props = props;
        this.renderString = "";
        this.enclosing = {
            start: "",
            end: ""
        };
        this.hasBlocks = false;
        this.hasChildren = false;
        this.blocks = new Map();
        this.h = {
            block: (name)=>{
                this.hasBlocks = true;
                return this.blocks.get(name) ?? null;
            },
            children: ()=>{
                this.hasChildren = true;
                return "@__children";
            }
        };
        this.template = this.templateFunction(this);
    }
    render() {
        return raw(this.template.toString());
    }
    open() {
        if (this.hasChildren) {
            const splitted = this.template.toString().split("@__children");
            this.enclosing.start = splitted.at(0);
            this.enclosing.end = splitted.at(-1);
        }
        return {
            instance: this,
            __type: "macro_opening_tag"
        };
    }
    close() {
        return {
            __type: "macro_closing_tag"
        };
    }
    html(strings, ...args) {
        const _strings = [
            "",
            ...strings,
            ""
        ];
        const _args = [
            this.open(),
            ...args,
            this.close()
        ];
        return TemplateStringBuilder(_strings, ..._args);
    }
}
const macro = (cb)=>{
    return (props)=>new Macro(cb, props);
};
const block = (name, content)=>({
        name,
        content,
        __type: "block"
    });
const raw = (value)=>({
        value,
        __type: "raw_string"
    });
const html = (strings, ...args)=>{
    return TemplateStringBuilder(strings, ...args);
};
const close = ()=>({
        __type: "macro_closing_tag"
    });
export { macro as macro };
export { block as block };
export { raw as raw };
export { html as html };
export { close as close };
