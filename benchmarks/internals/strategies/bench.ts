import htmlWithClasses from "./classes/page.ts"
import htmlWithSymbols from "./symbols/page.ts"
import htmlWithProperties from "./object_type_property/page.ts"

Deno.bench(
  "html with classes",
  { group: "rendering", baseline: true },
  () => {
    htmlWithClasses().string;
  },
);
Deno.bench(
  "html with symbols",
  { group: "rendering" },
  () => {
    htmlWithSymbols().string;
  },
);

Deno.bench(
  "html with properties",
  { group: "rendering" },
  () => {
    htmlWithProperties().string;
  },
);