let transitionSpeed = '1s';
let bubbleSize = '20%';
let returnPosition = 'top left'
let smoothInit = false;
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
class BubbleElem extends HTMLElement {
	constructor()
	{
		super();
        const init = ()=> {
            console.log(this.innerHTML)
            this.getTransitionSpeed = ()=>{
                return this.getAttribute('transition-speed')||transitionSpeed
            }
            this.getBubbleSize = ()=>{
                return this.getAttribute('bubble-size')||bubbleSize
            }
            this.getReturnPosition = () =>{
                return this.getAttribute('return-position') || returnPosition
            }
            this.smoothInit = () =>{
                return this.hasAttribute('smooth') || smoothInit
            }
            this.getElemFromAttribute = ()=> {
                if (!this._responsiveElem)
                {
                    const responsiveElemQuery = this.getAttribute('elem-bubbling')
                    console.log(responsiveElemQuery)
                    this._responsiveElem =
                    !isNaN(responsiveElemQuery)?
                        this.shadowRoot.children[responsiveElemQuery] 
                    :
                    (()=>{
                        const [, query, , index] = responsiveElemQuery.match(/([.#]?[a-z.#-]+)(\[([0-9]+)\])?/)
                        console.log(query, index)
                        return index===undefined?
                            this.querySelector(query)
                        :
                            this.querySelectorAll(query)[index]
                    })() // defines anon function and then runs function - lets me use ? : as if statement to look *fancy*
                }
                return this._responsiveElem
            }
            function multipCss(cssStr, multip)
            {
                let match = cssStr.match(/([\+-]?[0-9.]+)([a-z]+|%)/)
                return parseFloat(match[1])*multip+match[2]
            }
            const bubbling = this.getElemFromAttribute()
            console.log(bubbling)
            const t = this;
            let exitTimeout;
            bubbling.style.transition = `clip-path ${this.getTransitionSpeed()} cubic-bezier(0.45, 0.05, 0.55, 0.95)`
            this.style.display = 'block';
            if (this.smoothInit())
            {
                show({offsetX: bubbling.clientWidth/2, offsetY: bubbling.clientHeight/2});
                window.setTimeout(()=>{
                    hide({offsetX: bubbling.clientWidth/2, offsetY: bubbling.clientHeight/2});
                }, 0);
            }
            else
            {
                bubbling.style.clipPath = `circle(${multipCss(this.getBubbleSize(), .5)} at ${this.getReturnPosition()})`
            }
            function show(e)
            {
                bubbling.style.transition = `clip-path ${t.getTransitionSpeed()}`
                const maxSide = Math.max(bubbling.offsetWidth, bubbling.offsetHeight);
                function getDist(x1, y1, x2, y2)
                {
                    return Math.sqrt((x2-x1)**2+(y2-y1)**2)
                }
                function getDFromClick(x, y)
                {
                    return getDist(e.offsetX, e.offsetY, x, y)
                }
                const rad = Math.max(getDFromClick(0, maxSide), getDFromClick(maxSide, 0), getDFromClick(maxSide, maxSide), getDFromClick(0, 0))
                bubbling.style.clipPath = `circle(${rad}px at ${e.offsetX}px ${e.offsetY}px)`
                window.clearTimeout(exitTimeout)
            }
            this.onclick = ()=>{}; // need empty function for mobile safari to register mouse events
            this.addEventListener('mouseenter', show)
            
            function hide(e)
            {
                const clamp = (min, val, max)=>{
                    return Math.min(max, Math.max(val, min))
                }
                bubbling.style.clipPath = `circle(${t.getBubbleSize()} at ${clamp(0, e.offsetX, bubbling.clientWidth)}px ${clamp(0, e.offsetY, bubbling.clientHeight)}px)`
                exitTimeout = window.setTimeout(e=>{
                    bubbling.style.clipPath = `circle(${multipCss(t.getBubbleSize(), .5)} at ${t.getReturnPosition()})`
                    const prev = bubbling.style.transition;
                    bubbling.style.transition = `clip-path ${multipCss(t.getTransitionSpeed(), 2)} cubic-bezier(0.45, 0.05, 0.55, 0.95)`
                }, cssTimeToMs(t.getTransitionSpeed()))
            }
            this.addEventListener('mouseleave', hide)
        }
        if (!this.innerHTML)
		{

			// wait to run until the page is loaded if page is not loaded
			window.addEventListener('load', ()=>{
				init()
			})
		}
		else
		{
			init()
		}
	}
}
customElements.define('bubble-elem', BubbleElem)