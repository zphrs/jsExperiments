// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
class smoothPlaceholderInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.input = document.createElement("input");
    this.placeholder = document.createElement("label");
    this.placeholder.className = "placeholder";
    this.styleElement = document.createElement("style");
    this.styleElement.innerHTML = `
      .placeholder {
        position: absolute;
        top: 0;
        left: 0;
        color: #aaa;
        font-size: 1.2em;
        pointer-events: none;
        transition: all 0.2s ease-in-out;
      }
      input:focus ~ .placeholder {
        top: -.2em;
        font-size: 1em;
        color: #000;
      }
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 2em;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 0.5em;
        box-sizing: border-box;
      }
      input { 
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        background: none;
        font-size: 1em;
        color: #000;
        transition: all 0.2s ease-in-out;
      }
    `;
    this.shadowRoot.appendChild(this.styleElement);
  }
  connectedCallback() {
    console.log('HERE');
    this.getAttributeNames().forEach(attr => {
      if (attr == "placeholder")
      {
        this.placeholder.innerHTML = this.getAttribute(attr);
      }
      this.input.setAttribute(attr, this.getAttribute(attr));
    });
    this.shadowRoot.appendChild(this.input);
    this.shadowRoot.appendChild(this.placeholder);
  }
}
customElements.define('smooth-placeholder-input', smoothPlaceholderInput);