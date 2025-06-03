import { html, block, close } from "../../../mod.ts";

import {Layout} from "../macros/Layout.ts";
import {Card} from "../macros/Card.ts";
import {Paragraph} from "../macros/Paragraph.ts";

export default function Index() {
  // deno-fmt-ignore
  return Layout().html`
      ${block('head', html`
          <title>Hello from home</title>
          <script type="module" src="/static/index.js"></script>
      `)}
      ${block('content', html`
            <h1>Home page</h1>
            <p>Paragraph from home page</p>

            ${Paragraph({ text: "Hi from void macro", color: "red" }).render()}
            ${Paragraph({ text: "<h1>should be escaped</h1>", color: "orange" }).render()}

            ${Card({ color: "green" }).open()}
              <p>Hi there! <strong>Emmet works</strong></p>
            ${close()} 
            
            ${Card({ color: "blue" }).open()}
              <p>Hi there! <strong>Emmet works</strong></p>
            ${close()} 
            
            <counter-macro></counter-macro>
    
        `)}
  `
};