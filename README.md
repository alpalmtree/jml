# Jinja HTML
Jinja-flavoured html function.

## About
This package aims at producing html strings in the server and nothing more. It provides a jinja / nunjucks flavoured api but taking advantage of the fact that we are writing just JavaScript. Think of it like a middle ground between JSX and a regular template engine. Use it server-side in any JS runtime or in the browser without any build step, and still get blazing fast results (only ~1.07 slower than Preact).

## Getting started
```javascript
import { html, macro, block, close } from "https://deno.land/x/dhp@v0.0.2"
```
> Notice this is Deno only import. We are still working on the distribution on other registries, but for the time being, if you want to use it on either the browser or node, grab the distribution files from the `dist` folder.

## Example usage
```typescript
// Layout.ts
import { macro, html } from "https://deno.land/x/dhp@v0.0.2";

export const Layout = macro(({ h }) => {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${h.block("head")}
      </head>
      <body>
        ${h.block("content")} 
        ${h.block("scripts") ?? html`<script>console.log("no block content")</script>`}
      </body>
    </html>
  `;
});

// page.ts
import { block, close, html } from "https://deno.land/x/dhp@v0.0.2";

import { Layout } from "./Layout.ts";

export default function Page() {
  return Layout().html`
      ${block('head', html`
          <title>Hello from home</title>
          <script type="module" src="/static/index.js"></script>
        `)}
      ${block('content', html`
            <h1>Home page</h1>
            <p>Paragraph from home page</p>
        `)}
  `
}

// server.ts
import { serveDir } from "jsr:@std/http/file-server";
import Page from "./page.ts";

Deno.serve((req) => {
  const pathname = new URL(req.url).pathname;
  if (pathname.startsWith("/static")) {
    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "static",
    });
  }
  return new Response(Index().toString(), {
    headers: {
      "content-type": "html; charset=utf-8",
    },
  });
});
```

## Recommended settings and extensions
If you are using VSCode, we highly recommend using the [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) extension and adding the following to your emmet settings:

```json
"emmet.includeLanguages": {
    "javascript": "html",
    "typescript": "html"
}
```

