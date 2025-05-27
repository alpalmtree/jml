import { html, raw } from "./html.esm.js";

const toNode = (cb) => {
  const temp = document.createElement("template");
  temp.innerHTML = cb().string;
  return temp.content;
};

const scheduled = new Set();

const on = (event, cb) => {
  const id = crypto.randomUUID();
  scheduled.add(() => {
    document.querySelector(`[data-handle="${id}"]`).addEventListener(event, cb);
  });

  return raw(`data-handle="${id}"`);
};

const useClient = (cb) => {
  if (typeof document !== "undefined") {
    const clientState = cb();
    for (const key of Object.keys(clientState)) {
      if (typeof clientState[key] === "function") {
        clientState[key] = clientState[key].bind(clientState);
      }
    }
    return clientState;
  }
};

class CounterComponent extends HTMLElement {
  connectedCallback() {
    const state = useClient(() => {
        
      return {
        count: 0,
        inc() {
          this.count++;
          document.getElementById("count").textContent = this.count;
        },
      };
    });

    this.innerHTML = html`
      <div>
        <br>
        <i>With javascript</i>
        <br>
        <h2>Counter: <span id="count">0</span></h2>

        <button ${on("click", state.inc)}>Inc</button>
      </div>
    `.string;

    scheduled.forEach((cb) => cb());
  }
}

customElements.define("counter-component", CounterComponent);
