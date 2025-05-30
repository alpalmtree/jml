/**
 * We are measuring how long it takes to get a string
 * rendered on the server, so we need these these libraries.
 */
import { render } from "preact-render-to-string";
import { renderToString } from "react-dom/server";

import html from "./html_bench.ts"
import preact from "./preact_bench.tsx"
import react from "./react_bench.jsx"

Deno.bench(
  "html with macros",
  { group: "rendering", baseline: true },
  () => {
    html().toString();
  },
);

Deno.bench("preact jsx with components", { group: "rendering" }, () => {
  render(preact());
});

Deno.bench("react jsx with components", { group: "rendering" }, () => {
  renderToString(react());
});

