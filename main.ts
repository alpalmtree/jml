import { component, html, block } from "./html.ts";

const Layout = component((h) => {
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

const Card = component<{ color: string }>((h, props) => {
  return html`
    <div class="card" style="border: 1px solid ${props?.color ?? "red"}">
      ${h.children()}
      <p>I'm inside the card component layout. Color: ${props?.color}</p>
    </div>
  `;
});

const P = component<{ text: string; color?: string }>((_, props) => {
  return html`
    <p style="color: ${props?.color ?? "black"}">
      ${props?.text ??
      "No text provided"}
    </p>
  `;
});

const page = () => {
  // deno-fmt-ignore
  return html`
    ${Layout.open()} 

        ${block('head', html`
            <title>Hello from home</title>
        `)}

        ${block('content', html`
              <h1>Home page</h1>
              <p>Paragraph from home page</p>

              ${P.render({ text: "Hi from void component", color: "red" })}

              ${html`
                  ${Card.open({ color: "green" })}
                    <p>Hi there</p>
                  ${Card.close()}
              `} 
          `)}

        ${block('scripts', html`
            <script>console.log("hi from home")</script>
        `)}
    ${Layout.close()}
  `;
};

Deno.serve(() =>
  new Response(page().string, {
    headers: {
      "content-type": "html; charset=utf-8",
    },
  })
);
