// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
class smoothPlaceholderInput extends HTMLElement {
  constructor() {
    super();
    this.input = document.createElement("input");
    this.placeholder = document.createElement("label");
    this.placeholder.className = "placeholder";
    this.container = document.createElement("div");
    this.container.className = "container";
    this.styleElement = document.createElement("style");
    this.styleElement.innerHTML = `
      .placeholder {
        position: absolute;
        top: .5em;
        left: 0;
        color: #aaa;
        font-size: 1em;
        pointer-events: none;
        transition: all 0.2s ease-in-out;
        font-family: inherit;
        font-weight: inherit;
      }
      input:focus ~ .placeholder {
        left: 0;
        transform: translate3d(0,-.83em,0) scale(.83);
        transform-origin: left center;
        color: #777;
      }
      input::placeholder {
        color: transparent;
      }
      .container {
        display: block;
        position: relative;
        width: 100%;
        height: 3em;
        padding: 0;
        margin: 0;
      }
      .host {
        display: block;
        position: relative;
      }
      input { 
        position: absolute;
        bottom: -.2em;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        outline: none;
        border: none;
        background: none;
        font-size: 1em;
        font-family: inherit;
        color: #000;
        transition: all 0.2s ease-in-out;
      }
    `;
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
    this.appendChild(this.container);
    this.container.appendChild(this.styleElement);
    this.container.appendChild(this.input);
    this.container.appendChild(this.placeholder);
    this.classList.add("host");
    this.placeholder.for = this.input.id;
    let frozen = false;
    const inputChangeHandler = ()=>
    {
      if (this.input.value.length > 0)
      {
        if (!frozen) {
          this.styleElement.sheet.insertRule(`
          .placeholder {
            left: 0 !important;
            transform: translate3d(0,-.83em,0) scale(.83) !important;
            transform-origin: left center !important;
            color: #777 !important;
          }
          `, 0);
          frozen = true;
        }
      }
      else
      {
        if (frozen) {
          this.styleElement.sheet.removeRule(0);
          frozen = false;
        }
      }
    }
    this.input.addEventListener("keydown", inputChangeHandler);
    this.input.addEventListener("keyup", inputChangeHandler);
    this.input.addEventListener("change", inputChangeHandler);
    this.input.addEventListener("input", inputChangeHandler);
    this.input.addEventListener("focus", ()=>{
      this.classList.add("focus");
    });
    this.input.addEventListener("blur", ()=>{
      this.classList.remove("focus");
    });
  }
}
customElements.define('smooth-placeholder-input', smoothPlaceholderInput);