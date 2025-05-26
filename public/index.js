import { html } from "./html.esm.js";

console.log('hi')

const temp = document.createElement('template')
temp.innerHTML = html`<p>hi with javascript</p>`.string
document.body.append(temp.content)