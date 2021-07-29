// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

let transitionSpeed = '1s';
let bubbleSize = '20%';
let returnPosition = 'top left'
let smoothInit = false;
let matchHeight = '';
function cssTimeToMs(cssStr)
{
	const match = cssStr.match('([0-9.]+)(ms|s)')
	if (!match)
	{
		throw "Invalid css time. Try 1s or 1000ms";
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
                const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
                // Check if the media query matches or is not available.
                if (!mediaQuery || mediaQuery.matches) {
                    return '0s';
                }
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
            const getElemFromAttribute = (attributeName)=> {
                    const responsiveElemQuery = this.getAttribute(attributeName)
                    if (!responsiveElemQuery)
                    {
                        return undefined
                    }
                    console.log(responsiveElemQuery)
                    return !isNaN(responsiveElemQuery)?
                        this.children[responsiveElemQuery] 
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
            this.getBubbleElem = ()=>{
                return getElemFromAttribute('elem-bubbling')
            }
            this.getMatchHeight = ()=>{
                return getElemFromAttribute('match-height')
            }
            const matchHeight = this.getMatchHeight();
            function multipCss(cssStr, multip)
            {
                let match = cssStr.match(/([\+-]?[0-9.]+)([a-z]+|%)/)
                return parseFloat(match[1])*multip+match[2]
            }
            const bubbling = this.getBubbleElem()
            if (matchHeight)
            {
                console.log(matchHeight.scrollHeight)
                for (var i = 0; i < this.children.length; i++)
                {
                    if (this.children[i] === matchHeight)
                    {
                        continue;
                    }
                    this.children[i].style.height = `${matchHeight.scrollHeight}px`

                    this.children[i].style.width = `${matchHeight.scrollWidth}px`
                }
                window.addEventListener('resize', ()=>{
                    for (var i = 0; i < this.children.length; i++)
                    {
                        if (this.children[i] === matchHeight)
                        {
                            continue;
                        }
                        this.children[i].style.height = `${matchHeight.scrollHeight}px`

                        this.children[i].style.width = `${matchHeight.scrollWidth}px`
                    }
                })
            }
            const t = this;
            let exitTimeout;
            bubbling.style.transition = `clip-path ${this.getTransitionSpeed()} cubic-bezier(0.45, 0.05, 0.55, 0.95)`
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
                const rad = Math.max(getDFromClick(0, bubbling.offsetHeight), getDFromClick(bubbling.offsetWidth, 0), getDFromClick(bubbling.offsetWidth, bubbling.offsetHeight), getDFromClick(0, 0))
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
            this.addEventListener('focusin', (e)=>{
                console.log(e.target.offsetLeft)
                show({offsetX: e.target.offsetLeft+e.target.clientWidth/2, offsetY: e.target.offsetTop+e.target.clientHeight/2})
            })
            this.addEventListener('focusout', (e)=>{
                console.log(e.target.offsetLeft)
                hide({offsetX: e.target.offsetLeft+e.target.clientWidth/2, offsetY: e.target.offsetTop+e.target.clientHeight/2})
            })
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