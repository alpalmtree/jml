import htmlWithClasses from "./classes/page.ts"
import htmlWithSymbols from "./symbols/page.ts"

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