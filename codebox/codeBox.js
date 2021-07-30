// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
class CodeBox extends HTMLElement {
    constructor()
    {
        super();
        const setup = async ()=>
        {
            this.classList.add('code-box');
            this.fileLink = this.getAttribute('src');
            if (this.fileLink !== null)
            {
                // get the text from the file
                const file = await fetch(this.fileLink);
                this.text = await file.text();
            }
            else
            {
                this.text = this.getElementsByTagName('script')[0]?.innerHTML;
            }
            if (this.text === null)
            {
                this.text = this.innerHTML;
            }
            this.innerHTML = '';
            // make shadowDOM
            this.root = this;
            this.pre = document.createElement('pre');
            this.root.appendChild(this.pre);
            this.code = document.createElement('code');
            this.pre.appendChild(this.code);
            this.code.appendChild(document.createTextNode(this.text));
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