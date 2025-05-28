/**
 * We are using classes in the source code only to determine
 * if a certain object is "an instance of". As it turns out,
 * it is faster to declare a class than creating an object
 * and assigning a symbol.
 */

class Person {
  constructor(
    public name: string,
  ) {}
  public sayHi() {
    return `I'm ${this.name}`;
  }
}

const PersonSymbol = Symbol("person");
const PersonFn = (name: string) => {
  const self = {
    name: name,
    sayHi: () => `I'm ${self.name}`,
    [PersonSymbol]: {
      value: "person",
      enumerable: false,
    },
  };
  return self;
};

const person = (name: string) => {
  return new Person(name);
};

Deno.bench(
  "Creating with function",
  { group: "creating", baseline: true },
  () => {
    new Array(1000).fill(null).map((_, i) => PersonFn(`person ${i}`));
  },
);
Deno.bench(
  "Creating with class",
  { group: "creating" },
  () => {
    new Array(1000).fill(null).map((_, i) => new Person(`person ${i}`));
  },
);

Deno.bench(
  "creating with intermediate function",
  { group: "creating" },
  () => {
    new Array(1000).fill(null).map((_, i) => person(`person ${i}`));
  },
);

Deno.bench("creating plain object without constructor", { group: "creating" }, () => {
    new Array(1000).fill(null).map((_, i) => ({
      value: i,
      [closingTagSymbol]: true
    }));
})

class ClosingTag {}
const closingTagSymbol = Symbol('closing_tag')

const closingTag = () => ({ [closingTagSymbol]: true })

Deno.bench("Using dummy object to determine instance of", {
  group: "instanceof",
  baseline: true,
}, () => {
    const list = new Array(1000).fill(null).map(() => closingTag());

        list.forEach(item => {
            item && item[closingTagSymbol]
        })

});

Deno.bench("Using class to determine instance of", {
  group: "instanceof",
  baseline: true,
}, () => {
    const list = new Array(1000).fill(null).map(() => new ClosingTag());

        list.forEach(item => {
            item instanceof ClosingTag
        })

});