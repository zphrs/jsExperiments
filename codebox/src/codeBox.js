// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
export default class CodeBox extends HTMLElement {
    constructor(src=null)
    {
        super();
        this.src = src;
    }
    async connectedCallback() {
        this.classList.add('code-box');
        this.fileLink = this.src??this.getAttribute('src');
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
        this.root = this.attachShadow({mode: 'open'});
        const styleObj = window.getComputedStyle(this)
        const styleElem = document.createElement('style')
        let styleHTML = `
pre {
    background-color: inherit;
    margin: 0;
    height: inherit;
    width: inherit;
    max-width: inherit;
    max-height: inherit;
    overflow: inherit;
}
.msg {
    width: inherit;
    color: #4e4e4e;
    overflow: auto;
    margin: 0;
    text-align: center;
    padding: .25em;
    font-size: 1.15em;
    box-sizing: border-box;
}
.red {
    color: darkred;
}
`
        styleElem.innerHTML = styleHTML;
        this.root.appendChild(styleElem);
        this.pre = document.createElement('pre');
        this.message = document.createElement('p');
        this.message.className = 'msg'
        this.code = document.createElement('code');
        this.pre.appendChild(this.message)
        this.pre.appendChild(this.code);
        this.code.appendChild(document.createTextNode(this.text));
        this.root.appendChild(this.pre);
    }
    async changeFileLink(newFileLink) {
        this.fileLink = newFileLink;
        if (this.fileLink !== undefined)
        {
            // get the text from the file
            let showLoadingTimeout = window.setTimeout(()=>{
                this.text = 'loading...'
                this.code.firstChild.nodeValue = this.text;
            }, 500);
            fetch(this.fileLink).then(async (response)=>{
                if (response.status === 200)
                {
                    this.text = await response.text();
                    this.message.innerHTML = this.fileLink;
                    this.message.classList.toggle('red', false)
                }
                else
                {
                    this.text = '';
                    this.message.innerHTML = 'Error while fetching the file "'+this.fileLink+'" - ' + response.status + " (" + response.statusText +')'
                    this.message.classList.toggle('red', true)
                }
                this.code.firstChild.nodeValue = this.text;
                clearTimeout(showLoadingTimeout)
            })
            .catch(()=>{
                this.message.innerHTML = 'Error while fetching the file "'+this.fileLink+'"'
                this.text = ''
                this.message.classList.toggle('red', true)
                this.code.firstChild.nodeValue = this.text;
                clearTimeout(showLoadingTimeout)
            });
        }
        else
        {
            this.message.innerHTML = 'No file selected.'
            this.message.classList.toggle('red', false)
            this.text = '';
            this.code.firstChild.nodeValue = this.text;
        }
    }
}

// make a custom element
customElements.define('code-box', CodeBox);