// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
class smoothPlaceholderInput extends HTMLElement {
  constructor() {
    super();
    this.input = document.createElement("input");
    this.placeholder = document.createElement("label");
    this.placeholder.className = "smooth-placeholder-input-placeholder";
    this.container = document.createElement("div");
    this.container.className = "smooth-placeholder-input-container ";
    this.styleElement = document.createElement("style");
    this.styleElement.innerHTML = `
    .smooth-placeholder-input-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        transform: translate3d(0,50%,0);
        font-size: 1em;
        pointer-events: none;
        transition: all 0.2s ease-in-out;
        font-family: inherit;
        font-weight: inherit;
      }
      input:focus ~ .smooth-placeholder-input-placeholder,
      input.is-autofilled ~ .smooth-placeholder-input-placeholder {
        left: 0;
        transform: translate3d(0,0,0) scale(.83);
        transform-origin: left center;
      }
      .smooth-placeholder-input-container {
        display: block;
        position: relative;
        width: 100%;
        height: 3em;
        padding: 0;
        margin: 0;
        overflow: hidden;
      }
      :host {
        display: block;
        position: relative;
      }
      smooth-placeholder-input input { 
        position: absolute;
        left: 0;
        bottom: -1em;
        top: 0;
        padding-top: .5em;
        width: 100%;
        box-sizing: border-box;
        outline: none;
        border: none;
        background: none;
        font-size: 1em;
        font-family: inherit;
        display: flex;
        display: table-cell;
        vertical-align: bottom;
        transition: all 0.2s ease-in-out;
        min-height: 3em;
      }
      smooth-placeholder-input input {
        transition: background-color .2s ease-in-out 0s;
      }
      smooth-placeholder-input input::placeholder {
        color: transparent;
      }
    `;
    
  }
  connectedCallback() {
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
    this.input.id = "spi-"+this.input.id;
    this.placeholder.setAttribute("for", this.input.id);
    let frozen = false;
    const inputChangeHandler = ()=>
    {
      if (this.input.value.length > 0)
      {
        if (!frozen) {
          this.styleElement.sheet.insertRule(`
          #${this.getAttribute("id")} .smooth-placeholder-input-placeholder {
            left: 0;
            transform: translate3d(0,0,0) scale(.83);
            transform-origin: left center;
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
    this.input.addEventListener("invalid", ()=>{
      this.classList.add("invalid");
    });
    this.input.addEventListener("valid", ()=>{
      this.classList.remove("invalid");
    });
  }
}
customElements.define('smooth-placeholder-input', smoothPlaceholderInput);