import { macro, html } from "../../../mod.ts";

export default macro<{ color: string }>((h, props) => {
  return html`
    <div class="card" style="border: 1px solid ${props?.color ?? "red"}">
      ${h.children()}
      <p>I'm inside the card macro layout. Color: ${props?.color}</p>
    </div>
  `;
});