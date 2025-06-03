import { macro, html } from "../../../mod.ts";

export const Paragraph = macro<{ text: string; color?: string }>(({ props }) => {
  return html`
    <p style="color: ${props?.color ?? "black"}">
      ${props?.text ??
    "No text provided"}
    </p>
  `;
});