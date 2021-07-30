class CodeBox extends HTMLElement {
    constructor()
    {
        super();
        const setup = ()=>
        {
            console.log('here')
            this.classList.add('code-box');
            this.code = this.innerHTML;
            // make shadowDOM
            this.root = this.attachShadow({mode: 'open'});
            this.pre = document.createElement('pre');
            this.root.appendChild(this.pre);
            this.code = document.createElement('code');
            this.pre.appendChild(this.code);
            this.code.appendChild(document.createTextNode(this.innerHTML));
            this.pre = this.querySelector('pre');
            this.code = this.querySelector('code');
        }
        if (this.innerHTML)
        {
            setup();
        }
        else
        {
            window.addEventListener('DOMContentLoaded', setup);
        }
    }
}

// make a custom element
customElements.define('code-box', CodeBox);