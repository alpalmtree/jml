import { macro, html } from "../../../mod.ts";

export default macro<{ text: string; color?: string }>((_, props) => {
  return html`
    <p style="color: ${props?.color ?? "black"}">
      ${props?.text ??
    "No text provided"}
    </p>
  `;
});