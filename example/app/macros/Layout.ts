import { macro, html } from "../../../mod.ts";

export const Layout = macro(({ h }) => {
  // deno-fmt-ignore
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
        ${h.block("scripts") || html`<script>console.log("no block content")</script>`}
      </body>
    </html>
  `;
});