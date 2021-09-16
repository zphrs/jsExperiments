// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
import CodeBox from "./codeBox.js";
class ModalCodebox extends HTMLElement {
	constructor() {
		super();
	}
	select(index)
	{
		if (index === undefined)
		{
			this.selected && this.selected.classList.toggle('selected', false)
			this.codeBox.changeFileLink();
			return;
		}
		this.selected && this.selected.classList.toggle('selected', false)
		this.selected = this.tabBar.children[index];
		this.selected.classList.toggle('selected', true)
		this.codeBox.changeFileLink(this.fileLinks[index])
	}
	// finds the minimum shared directory.
	_getMinSharedDirect()
	{
		let minDirectory = this.fileLinks[0].split('/')
		for (var i = 1; i<this.fileLinks.length; i++)
		{
			let e = this.fileLinks[i]
			if (e.charAt(e.length-1) === '/')
			{
				e += 'index.html'
			}
			const fileLinkDir = e.split('/')
			for (var j = 0; j<minDirectory.length; j++)
			{
				if (minDirectory[j] !== fileLinkDir[j])
				{
					if (j === 0)
					{
						minDirectory = [];
						break;
					}
					minDirectory = fileLinkDir.slice(0, j);
					break;
				}
			}
		}
		if (minDirectory.length>0)
		{
			minDirectory = minDirectory.join('/')+'/'
		}
		else
		{
			minDirectory = ''
		}
		return minDirectory;
	}
	connectedCallback() {
		this.fileLinks = JSON.parse(this.getAttribute('srcs'));
		this.tabBar = document.createElement('div');
		this.tabBar.className = 'tab-bar'
		this.tabBar.onclick = (event)=>((event.target === this.tabBar) && this.select())
		this.appendChild(this.tabBar)
		if (this.fileLinks[0].charAt(this.fileLinks[0].length-1) === '/')
		{
			this.fileLinks[0] += 'index.html'
		}
		this.minDirectory = this._getMinSharedDirect();
		// makes fileLinks appear on the tabBar
		this.fileLinks.forEach((fileLink, i)=>{
			const title = document.createElement('button')
			const fileNameAbbr = fileLink.slice(this.minDirectory.length);
			title.innerHTML = fileNameAbbr
			title.className = 'filename'
			title.setAttribute('title', fileNameAbbr)
			this.tabBar.appendChild(title)
			title.onclick = () => this.select(i)
		})
		this.style.setProperty("--bright", "#BFBFBF");
		this.style.setProperty("--medium-bright", "#9B9B9B");
		this.style.setProperty("--highlight", "rgba(255, 255, 255, .66)");
		this.style.setProperty("--dark", "rgba(0, 0, 0, .5)");
		this.styleElem = document.createElement('style')
		this.styleElem.innerHTML = 
`
.tab {
	max-height: 100%;
	max-width: 100%;
	overflow: auto;
}
.filename {
	border: none;
	outline: none;
	background-color: var(--medium-bright);
	margin: 0;
	padding: 10px;
	padding-left: calc(min(5vw, 20px) + 5px);
	padding-right: min(5vw, 20px);
	position: relative;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: pre;
	width: max-content;
	flex-grow: 0;
	flex-shrink: 1;
	cursor: pointer;
	transition: border-radius .5s, background-color .5s, padding-left .5s;
}
.filename::before {
	content: '';
	position: absolute;
	left: 0;
	width: 5px;
	top: 5px;
	bottom: 5px;
	display: inline-block;
	background-color: var(--dark);
}
.filename:first-child::before {
	display: none;
}
.filename.selected {
	background-color: var(--bright);
	border-radius: 10px 10px 0 0;
}
.filename.selected {
	padding-left: min(5vw, 20px);
}
.filename.selected::before {
	display: none;
}
.filename.selected+.filename::before {
	display: none;
}
.filename:focus {
	background-color: var(--highlight);
	z-index: 2;
}
.filename:hover {
	background-color: var(--highlight);
}
.tab-bar {
	display: flex; 
	width: 100%;
	max-width: 100%;
	overflow: hidden; 
	background-color: var(--dark);
	position: relative;
}
file-upload input[type="file"] {
	display: none;
}
code-box {
	background-color: var(--bright);
	width: 100%;
	overflow: auto;
}
file-upload label {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	cursor: pointer;
	display: none;
	background-color: var(--dark);
}
code-box {
	background-color: var(--bright);
	max-height: 80%;
	width: 100%;
	overflow: auto;
}
`

		this.appendChild(this.styleElem)
		this.codeBox = new CodeBox()
		this.appendChild(this.codeBox)
		this.select(0)
	}
}

customElements.define('modal-codebox', ModalCodebox);