
let transitionSpeed = '1s';
let bubbleSize = '20px';
let returnPosition = 'top left'
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
class ImgBubble extends HTMLElement {
	constructor()
	{
		super();
		this.getTransitionSpeed = ()=>{
			return this.getAttribute('transition-speed')||transitionSpeed
		}
		this.getBubbleSize = ()=>{
			return this.getAttribute('bubble-size')||bubbleSize
		}
		this.getReturnPosition = () =>{
			return this.getAttribute('return-position') || returnPosition
		}
		function multipCss(cssStr, multip)
		{
			let match = cssStr.match(/([\+-]?[0-9.]+)([a-z]+|%)/)
			return parseFloat(match[1])*multip+match[2]
		}
		this.attachShadow({mode:'open'})
		const img = document.createElement('img');
		img.style.maxHeight = '100%';
		img.style.maxWidth = '100%';
		img.style.width = this.width;
		img.style.height = this.height;
		img.style.clipPath = `circle(${multipCss(this.getBubbleSize(), .5)} at ${this.getReturnPosition()})`
		img.style.transition = `clip-path ${this.getTransitionSpeed()} cubic-bezier(0.45, 0.05, 0.55, 0.95)`
		this.shadowRoot.append(img);
		img.setAttribute('src', this.getAttribute('src'))
		img.setAttribute('width', this.getAttribute('width'))
		img.setAttribute('height', this.getAttribute('height'))
		img.style.maxWidth = this.width;
		this.style.display = 'block';
		const t = this;
		function setDimensions()
		{
			t.style.width = (t.getAttribute('width') === null||img.scrollWidth)+'px';
			t.style.height = (t.getAttribute('height') === null||img.scrollHeight)+'px';
		}
		window.addEventListener('resize', e=>{
			t.style.width = ''
			t.style.height = ''
			// window.innerWidth;
			setDimensions();
		})
		if (img.complete)
		{
			setDimensions()
		}
		else
		{
			img.addEventListener('load', setDimensions)
			img.addEventListener('error', setDimensions)
		}
		const imgSrc = this.getAttribute('src');
		let exitTimeout;
		function show(e)
		{
			img.style.transition = `clip-path ${this.getTransitionSpeed()}`
			const maxSide = Math.max(img.offsetWidth, img.offsetHeight);
			function getDist(x1, y1, x2, y2)
			{
				return Math.sqrt((x2-x1)**2+(y2-y1)**2)
			}
			function getDFromClick(x, y)
			{
				return getDist(e.offsetX, e.offsetY, x, y)
			}
			const rad = Math.max(getDFromClick(0, maxSide), getDFromClick(maxSide, 0), getDFromClick(maxSide, maxSide), getDFromClick(0, 0))
			img.style.clipPath = `circle(${rad}px at ${e.offsetX}px ${e.offsetY}px)`
			window.clearTimeout(exitTimeout)
		}
		this.onclick = ()=>{}; // need empty function for mobile safari to register mouse events
		this.addEventListener('mouseenter', show)
		
		function hide(e)
		{
			const clamp = (min, val, max)=>{
				return Math.min(max, Math.max(val, min))
			}
			img.style.clipPath = `circle(${this.getBubbleSize()} at ${clamp(0, e.offsetX, img.clientWidth)}px ${clamp(0, e.offsetY, img.clientHeight)}px)`
			exitTimeout = window.setTimeout(e=>{
				img.style.clipPath = `circle(${multipCss(this.getBubbleSize(), .5)} at ${this.getReturnPosition()})`
				const prev = img.style.transition;
				img.style.transition = `clip-path ${multipCss(this.getTransitionSpeed(), 2)} cubic-bezier(0.45, 0.05, 0.55, 0.95)`
			}, cssTimeToMs(this.getTransitionSpeed()))
		}
		this.addEventListener('mouseleave', hide)
	}
}
customElements.define('img-bubble', ImgBubble)