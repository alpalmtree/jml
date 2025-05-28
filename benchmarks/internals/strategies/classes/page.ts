import { block, macro, html } from "./html.ts";
const Layout = macro((h) => {
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
        ${h.block("scripts")}
      </body>
    </html>
  `;
});

const Card = macro<{ color: string }>((h, props) => {
  return html`
    <div class="card" style="border: 1px solid ${props?.color ?? "red"}">
      ${h.children()}
      <p>I'm inside the card macro layout. Color: ${props?.color}</p>
    </div>
  `;
});

const P = macro<{ text: string; color?: string }>((_, props) => {
  return html`
    <p style="color: ${props?.color ?? "black"}">
      ${props?.text ??
    "No text provided"}
    </p>
  `;
});

const page = () => {
  // deno-fmt-ignore
  return Layout.html`

      ${block('head', html`
          <title>Hello from home</title>
      `)}

      ${block('content', html`
            <h1>Home page</h1>
            <p>Paragraph from home page</p>
            
            ${P.render({ text: "Hi from void macro", color: "red" })}

            ${Card.open({ color: "green" })}
              <p>Hi there! <strong>Emmet works</strong></p>
            ${Card.close()} 
            
            ${Card.with({ color: "blue" }, (c) => c.html`
              <p>Hi there with <code>with</code> statement</p>
            `)}
        `)}
     

      ${block('scripts', html`
          <script>console.log("hi from home")</script>
      `)}
  `
};

export default page