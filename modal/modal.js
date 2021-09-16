// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

'use strict';
function posOnDocument(elem)
{
	let pos = {x:0, y:0}
	while (elem)
	{
		pos.x += elem.offsetLeft
		pos.y += elem.offsetTop
		elem = elem.offsetParent
	}
	return pos
}
class popupHolder extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this.background = document.createElement('div');
		this.background.className = "popup-background hide"
		this.shadowRoot.appendChild(this.background);
		this.popup = document.createElement("div");
		this.popup.classList = "popup"
		this.background.appendChild(this.popup);
		this.styleElement = document.createElement('style')
		this.styleElement.innerHTML = `
		.popup {
			max-width: 100%;
			max-height: 100%;
			overflow: auto;
			background-color: lightgreen;
			transition: all 1s;
			position: absolute;
		}
		.popup-background {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background-color: black;
			transition: all 1s;
		}
		.popup-background.hide {
			background-color: transparent;
			pointer-events: none;
		}
		.popup-background.hide .popup {
			filter: opacity(0);
		}
		body {
			min-height: 100%;
			min-width: 100%;
			margin: 0;
		}
		html {
			min-height: 100%;
			min-width: 100%;
		}
		`
		this.shadowRoot.appendChild(this.styleElement)
	}
	connectedCallback() {
		this.background.addEventListener('click', e => {
			if (e.target == this.background)
				this.hide()
		})
	}
	show(responsiveElemOnPage, baseNode, responsiveElemInBaseNode) {
		
		this.hidingTimeout && window.clearTimeout(this.hidingTimeout)
		this.popup.firstChild && this.popup.removeChild(this.popup.firstChild);


		this.respondingTo = responsiveElemOnPage;
		this.matchingLocation = responsiveElemInBaseNode;
		this.baseNodeCopy = baseNode.cloneNode(true);
		
		this.baseNodeCopy.style.position = "relative";
		this.popup.appendChild(this.baseNodeCopy);

		const pos = posOnDocument(this.respondingTo);
		this.popup.style.left = pos.x+"px"
		this.popup.style.top = pos.y+"px"
		let clickableElemSize = {
			width: this.matchingLocation.offsetWidth,
			height: this.matchingLocation.offsetHeight
		}
		let clickableElemPosInPopup = {
			x: this.matchingLocation.offsetLeft,
			y: this.matchingLocation.offsetTop
		}
		this.popup.style.transition = "none";
		this.popup.style.clipPath =  `polygon(
			${clickableElemPosInPopup.x}px ${clickableElemPosInPopup.y}px,
			${clickableElemPosInPopup.x + clickableElemSize.width}px ${clickableElemPosInPopup.y}px,
			${clickableElemPosInPopup.x + clickableElemSize.width}px ${clickableElemPosInPopup.y + clickableElemSize.height}px,
			${clickableElemPosInPopup.x}px ${clickableElemPosInPopup.y + clickableElemSize.height}px
		)`

		window.setTimeout(() => {
			// set the clip path to the size of the baseNode after the clip path for the popup has been set to the size of the clickable element
			this.popup.style.transition = "";
			this.popup.style.clipPath =  `polygon(
				${0}px ${0}px,
				${this.baseNodeCopy.offsetWidth+this.baseNodeCopy.offsetLeft}px ${0}px,
				${this.baseNodeCopy.offsetWidth+this.baseNodeCopy.offsetLeft}px ${this.baseNodeCopy.scrollHeight + this.baseNodeCopy.offsetTop}px,
				${0}px ${this.baseNodeCopy.offsetHeight + this.baseNodeCopy.offsetTop}px
			)`
			// eventually replace with the position of the clickable element minus the offset from the clickable element to the popup
			// this.popup.style.left = 0
			// this.popup.style.top = 0
			this.background.classList.remove('hide')
			this.popup.classList.remove('hide')
		}, 0)
		this.background.classList.remove('hide')
	}
	handleResize() {
		if (this.respondingTo) {
			this.popup.style.clipPath =  "none";
			const pos = posOnDocument(this.respondingTo);
			this.popup.style.left = pos.x
			this.popup.style.top = pos.y
		}
	}
	hide() {
		this.background.classList.add('hide')
		this.popup.classList.add('hide')
		this.hidingTimeout = window.setTimeout(()=>this.popup.innerHTML = "" , 1000)
	}
}
customElements.define('popup-holder', popupHolder);
/**
 * <modal expand-elem="Nth child | #id | .className (first occurance) | tagname(first occurance) | tagname[Nth elem]..." elemToModal="true (image animates to position in modal) | false(modal positions so elem doesn't move)" transition-speed="[0-9]+s|ms">
 * 
 *  
 */
function cssTimeToMs(cssStr)
{
	const match = cssStr.match('([0-9.]+)(ms|s)')
	if (!match)
	{
		return;
	}
	let [,num,unit] = match;
	if (unit == 'ms')
	{
		return num;
	}
	if (unit=='s')
	{
		return num*1000;
	}
}

document.addEventListener('readystatechange', ()=>{
	if (document.readyState === 'interactive')
	{
		const holder = document.createElement('popup-holder');		
		document.body.prepend(holder)
	}
})
class expandingModal extends HTMLElement {
	constructor()
	{
		super();
		this.getElemFromQuery = (inpQuery)=> {
			return !isNaN(inpQuery)?
				this.children[inpQuery]
			:
			(()=>{
				const [, query, , index] = inpQuery.match(/([.#]?[a-z-]+)(\[([0-9]+)\])?/)
				console.log(this.querySelector(query), query, index)
				return index===undefined?
					this.querySelector(query)
				:
					this.querySelectorAll(query)[index]
			})()
		}
		this.getResponsiveElem = ()=> {
			if (!this._responsiveElem)
			{
				const responsiveElemQuery = this.getAttribute('responsive-elem')
				console.log(responsiveElemQuery)
				this._responsiveElem = this.getElemFromQuery(responsiveElemQuery)
			}
			return this._responsiveElem
		}
	}
	connectedCallback() {
		this.styleElement = document.createElement('style')
		this.style.display = "block";
		window.setTimeout(()=>{ // wait for the modal to be added to the dom
			this.getResponsiveElem();
			this._responsiveElem.addEventListener('click', ()=>{
				this.show()
			})
		}, 100)
	}
	show() {
		const responsiveElem = this.getResponsiveElem()
		const holder = document.querySelector('popup-holder')
		holder.show(responsiveElem, this, responsiveElem)
	}
}
customElements.define('expanding-modal', expandingModal)