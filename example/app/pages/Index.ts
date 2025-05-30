import { html, block } from "../../../mod.ts";

import Layout from "../macros/Layout.ts";
import Card from "../macros/Card.ts";
import Paragraph from "../macros/Paragraph.ts";

export default function Index() {
  // deno-fmt-ignore
  return Layout.html`
      ${block('head', html`
          <title>Hello from home</title>
          <script type="module" src="/static/index.js"></script>
      `)}

      ${block('content', html`
            <h1>Home page</h1>
            <p>Paragraph from home page</p>

            ${Paragraph.render({ text: "Hi from void macro", color: "red" })}
            ${Paragraph.render({ text: "<h1>should be escaped</h1>", color: "orange" })}


            ${Card.open({ color: "green" })}
              <p>Hi there! <strong>Emmet works</strong></p>
            ${Card.close()} 
            
            ${Card.with({ color: "blue" }, (c) => c.html`
              <p>Hi there with <code>with</code> statement</p>
            `)}
            <counter-macro></counter-macro>
        `)}
  `
};