// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

'use strict';
/**
 * <modal expand-elem="Nth child | #id | .className (first occurance) | tagname(first occurance) | tagname[Nth elem]..." elemToModal="true (image animates to position in modal) | false(modal positions so elem doesn't move)" transition-speed="[0-9]+s|ms">
 * 
 *  
 */
const popupHolder = document.createElement('div')
popupHolder.className = 'popup-background hide'
const popup = document.createElement('div');
popup.classList = 'popup'
popupHolder.appendChild(popup)
let popupStyle = document.createElement('style')
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
function hidePopup(transitionTime)
{
	popupHolder.classList.toggle('hide', true)
	window.setTimeout(cssTimeToMs(transitionTime))
}
popupStyle.innerHTML = `
.popup {
	max-width: 100%;
	width: 800px;
	max-height: 100%;
	overflow: auto;
	padding: 10px;
	margin-top: auto;
	margin-bottom: auto;
	border-radius: 10px;
	background-color: lightgreen;
	transition: all 1s;
}
.popup-background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
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
document.head.appendChild(popupStyle)
document.addEventListener('readystatechange', ()=>{
	if (document.readyState === 'interactive')
	{
		document.body.prepend(popupHolder)
	}
})
class expandingModal extends HTMLElement {
	constructor()
	{
		this.getResponsiveElem() = ()=> {
			if (!this._responsiveElem)
			{
				const responsiveElemQuery = this.getAttribute('responsive-elem')
				this._responsiveElem = 
				!isNaN(responsiveElemQuery)?
					this.children[responsiveElemQuery]
				:
				(()=>{
					const [, query, , index] = responsiveElemQuery.match(/([.#]?[a-z]+)(\[([0-9]+)\])?/)
					return index===null?
						this.querySelector(query)
					:
						this.querySelectorAll(query)[index]
				})() // defines anon function and then runs function - lets me use ? : as if statement to look *fancy*
			}
			return this._responsiveElem
		}

	}
}
customElements.define('expanding-modal', HTMLElement)