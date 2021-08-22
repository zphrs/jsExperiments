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
			console.log(fileLinkDir, minDirectory)
			for (var j = 0; j<minDirectory.length; j++)
			{
				if (minDirectory[j] !== fileLinkDir[j])
				{
					if (j === 0)
					{
						minDirectory = [];
						console.log('here')
						break;
					}
					console.log(minDirectory);
					minDirectory = fileLinkDir.slice(0, j);
					break;
				}
			}
		}
		if (minDirectory.length>0)
		{
			minDirectory = minDirectory.join('/')+'/'
			console.log(minDirectory)
		}
		else
		{
			minDirectory = ''
		}
		return minDirectory;
	}
	connectedCallback() {
		this.fileLinks = JSON.parse(this.getAttribute('srcs'));
		console.log(this.fileLinks)
		this.tabBar = document.createElement('div');
		this.tabBar.className = 'tab-bar'
		this.tabBar.onclick = (event)=>((event.target === this.tabBar) && this.select())
		this.appendChild(this.tabBar)
		if (this.fileLinks[0].charAt(this.fileLinks[0].length-1) === '/')
		{
			this.fileLinks[0] += 'index.html'
		}
		this.minDirectory = this._getMinSharedDirect();
		console.log(this.minDirectory);
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
	background-color: #9B9B9B;
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
	background-color: #4e4e4e;
}
.filename:first-child::before {
	display: none;
}
.filename.selected {
	background-color: #BFBFBF;
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
	background-color: #ccc;
	z-index: 2;
}
.filename:hover {
	background-color: #ccc;
}
.tab-bar {
	display: flex; 
	width: 100%;
	max-width: 100%;
	overflow: hidden; 
	background-color: #4e4e4e;
	position: relative;
}
file-upload input[type="file"] {
	display: none;
}
code-box {
	background-color: #BFBFBF;
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
	background-color: #4e4e4e;
}
code-box {
	background-color: #BFBFBF;
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