class ExpVis extends HTMLElement {
	constructor() {
		super()
		window.addEventListener('load', e=>{

			// convert expression to Exp object
			this.exp = new Exp(this.innerHTML)

			this.shadow = this.attachShadow({mode:'open'})
			// append css style to shadow dom
			this.shadow.appendChild(document.createElement('style'))
			const style = this.shadow.querySelector('style')
			style.textContent = `
				p {
					font-family: monospace;
				}
				.exp {
					font-family: monospace;
					font-size: 1em;
					color: #000;
					background-color: #fff;
					display: inline-flex;
					width: max-content;
					align-items: center;
					padding-left: 0.5em;
					padding-right: 0.5em;
				}
				.exp-op {	
					font-family: monospace;
					font-size: 1em;
					color: #000;
					padding-left: 0.5em;
					padding-right: 0.5em;
					border-radius: 0.5em;
					background-color: #fff;
					display: inline-flex;
					width: max-content;
					align-items: center;
				}
				.exp-op.add {
					background-color: #0f0;
				}
				.exp-op.sub {
					background-color: #f00;
				}
				.exp-op.mul {
					background-color: #0f0;
				}
				.exp-op.div {
					background-color: #f00;
				}
			`
			this.shadow.appendChild(style)

			this.shadow.appendChild(this.exp)
			
			this.evalBtn = document.createElement("button");
			this.evalBtn.innerHTML = "Evaluate Fully"
			this.evalBtn.onclick = ()=>{
				this.exp.evalFully()
			}
			this.shadow.appendChild(this.evalBtn)

			// create button to take one step towards evaulation
			this.stepBtn = document.createElement("button");
			this.stepBtn.innerHTML = "Step"
			this.stepBtn.onclick = ()=>{
				this.exp.step()
			}
			this.shadow.appendChild(this.stepBtn)

			// create go back button
			this.backBtn = document.createElement("button");
			this.backBtn.innerHTML = "Back"
			this.backBtn.onclick = ()=>{
				this.exp.goBack()
			}
			this.shadow.appendChild(this.backBtn)

			// create a reset button
			this.resetBtn = document.createElement("button");
			this.resetBtn.innerHTML = "Reset"
			this.resetBtn.onclick = ()=>{
				this.exp.reset()
			}
			this.shadow.appendChild(this.resetBtn)

			// create new div that goes above the exp 
			this.result = document.createElement("div")
			this.result.className = "visualize"
			this.shadow.appendChild(this.result)
		})
	}

}

function strToExp(str)
{
	// take the non-parenthasized +-/* and parenthesize with recursion
	// ex. 1+2+3 -> ((1+2)+3)
	function parenthasizer(str, runningOutput)
	{
		regex = /^\(?([+*\-%])?(.+?)([+*\-%])(.+?)((?:[+*\-%])?.*)\)?/
		match = regex.exec(str)
		if(match)
		{
			console.log(match)
			if (match[1])
			{
				return parenthasizer(match[5], "(" + runningOutput + match[1] + match[2] + match[3] + match[4] + ")")
			}
			return parenthasizer(match[5], '(' + match[2] + match[3] + match[4] + ')')
		}
		else
		{
			return str;
		}
	}
}
/**
 * supported operands: +, -, *, /, %, **
 * Supported math functions: anything that starts with "math."
 */
class Exp extends HTMLElement {
	constructor(exp, visElem) {
		super()
		if (!exp)
		{
			throw new Error("Expression is empty")
		}
		if (!visElem)
		{
			this.isBase = true;
			this.visElem = new ExpVisElem()
			this.appendChild(this.visElem)
		}
		else
		{
			this.visElem = visElem
		}


		const init = ()=>{
			this.exp = this.innerHTML
			/*regex to match expression like (1+2) or (1+(2*2))*/
			let expPattern1 = /^\((.+)([+*/\-%])(.+)\)/
			let expPattern2 = /^\((.+)([+*/\-%])(.+)\)/
			// get matches and put them in an array
			let matches = expPattern1.exec(exp) ?? expPattern2.exec(exp)
			if (!matches) {
				// if the expression does not match, check for math operations like math.sqrt(3)
				let mathPattern = /(Math\.[a-zA-Z0-9_]+)(\((?:.*)\))/g
				matches = mathPattern.exec(this.exp)
				if (!matches) {
					// if the expression does not match, throw an error
					console.log(this.exp)
					throw new Error("Invalid expression, "+this.exp)
				}
				this.op = matches.splice(1, 1)[0]
				this.exps = matches[1].split(',')
				this.opVis = this.op
				this.isMathOp = true;
			}
			else
			{
				matches.shift()
				// remove the second match from the array
				this.op = matches.splice(1, 1)[0]
				this.exps = matches
				this.opVis = this.op;
			}
			// for each exp in exps, check if number. If it is not a number, convert it into an Exp
			if (this.exps[0] == "()")
			{
				this.exps = []
			}
			else	
			{
				this.exps = this.exps.map(exp=>{
					let num = exp.replace(/\(|\)/g, '')
					console.log(num)
					if (exp == '()')
					{
						return null
					}
					if (isNaN(num)) {
						return new Exp(exp, this.visElem)
					}
					return +num
				})
			}
			if (this.op == '+') {
				this.op = (a, b) => a + b
			}
			else if (this.op == '-') {
				this.op = (a, b) => a - b
			}
			else if (this.op == '*') {
				this.op = (a, b) => a * b
			}
			else if (this.op == '/') {
				this.op = (a, b) => a / b
			}
			else if (this.op == '%') {
				this.op = (a, b) => a % b
			}
			else if (this.op == '**') {
				this.op = (a, b) => a ** b
			}
			// otherwise dangerously assume this is a math function and run the math op as a js function
			else {
				this.op = (...a) => 
				{
					exp = `${this.opVis}(${a.map(e=>e.valueOf()).join(',')})`
					return eval(exp)
				}
			}

			// render tree of exps
			this.render()
		}

		if (exp)
		{
			this.innerHTML = exp
		}

		if (!this.innerHTML)
		{

			// wait to run until the page is loaded if page is not loaded
			this.addEventListener('load', ()=>{
				init()
			})
		}
		else
		{
			init()
		}
	}
	valueOf() {
		if (!this.value)
		{
			this.value = this.op(...this.exps)
		}
		this.visElem.overlay(this)
		return this.value
	}
	getWidth() 
	{
		return this.offsetWidth
	}
	getLeft()
	{
		if (!this.isBase)
		{
			return (this.parentElement?.parentElement?.getLeft() ?? 0) + this.offsetLeft
		}
		return this.div.clientLeft
	}
	reset() {
		this.value = undefined
		// reset all exps
		for (var i = 0; i<this.exps.length; i++)
		{
			let exp = this.exps[i]
			// only reset exp if it is an Exp
			if (exp.value)
			{
				exp.reset()
			}
		}
		this.visElem.reset()
	}
	toString() {
		if (this.value)
		{
			return `<div class='solution'>${this.value.toString()}</div>`
		}
		// assign class based on the opVis
		let opClass = this.opVis == '+' ? 'add' : this.opVis == '-' ? 'sub' : this.opVis == '*' ? 'mul' : this.opVis == '/' ? 'div' : this.opVis == '%' ? 'mod' : this.opVis == '**' ? 'exp' : 'unknown'
		if (this.isMathOp)	
		{
			return `<div class='exp' style='${this.style?.cssText}'>${this.opVis}(${this.exps.map(e=>e.toString()).join(',')})</div>`
		}
		// render the firstExp
		return `
		<div class="exp" style='${this.exps[0].style?.cssText}'>${this.exps[0]}</div>
		<div class="exp-op ${opClass}">${this.opVis}</div>
		<div class="exp" style='${this.exps[1].style?.cssText}'>${this.exps[1]}</div>`
		
	}
	step() {
		// only get the value of the deepest node calculation
		// check if first and secondexp are numbers
		for (var i = 0; i<this.exps.length; i++)
		{
			if (this.exps[i] instanceof Exp && !this.exps[i].value) {
				return this.exps[i].step();
			}
		}
		console.log(this.valueOf())
		this.valueOf()
		this.render()
		return this
	}
	goBack() {
		// revert the most shallow node calculation
		if (this.value)
		{
			this.reset();
			return
		}
		for (var i = 0; i<this.exps.length; i++)
		{
			if (this.exps[i] instanceof Exp) {
				this.exps[i].goBack()
				return;
			}
		}
	}
	evalFully()
	{
		return this.valueOf()
	}

	render()
	{
		// create a shadow dom 
		if (!this.div)
		{
			this.innerHTML = ''
			// create a new div
			this.div = document.createElement("div")
			this.div.className = "exp"
			// append div to shadow dom
			this.appendChild(this.div)
			// append a style to the shadow dom

			if (this.isBase)
			{
				console.log('HERERERE')
				this.div.appendChild(this.visElem)
				this.div.style.position = 'relative'
			}

			if (this.isMathOp)	
			{
				this.div.appendChild(document.createTextNode(this.opVis+'('))
				this.exps.forEach((exp, i)=>{
					if (exp instanceof Exp)
					{
						exp.render()
						this.div.appendChild(exp)
					}
					else
					{
						document.createTextNode(exp)
						this.div.appendChild(document.createTextNode(exp))
					}
					if (i < this.exps.length-1)
					{
						this.div.appendChild(document.createTextNode(','))
					}
				})
				this.div.appendChild(document.createTextNode(')'))
			}
			else
			{
				let opClass = this.opVis == '+' ? 'add' : this.opVis == '-' ? 'sub' : this.opVis == '*' ? 'mul' : this.opVis == '/' ? 'div' : this.opVis == '%' ? 'mod' : this.opVis == '**' ? 'exp' : 'unknown'
				
				if (this.exps[0] instanceof Exp)
				{
					this.div.appendChild(this.exps[0])
				}
				else
				{
					this.div.appendChild(document.createTextNode(this.exps[0]))
				}

				this.div.appendChild(document.createTextNode(this.opVis))
				console.log(this.exps[1])
				if (this.exps[1] instanceof Exp)
				{
					this.div.appendChild(this.exps[1])
				}
				else
				{
					this.div.appendChild(document.createTextNode(this.exps[1]))
				}
			}
		}
	}
}

class ExpVisElem extends HTMLElement {
	constructor() {
		super()
		this.style = `
			position: absolute;
			top: -25%;
			left: 0;
			width: 0;
			height: 150%;
			background-color: #00FF8C;
			padding: 0px;
			box-sizing: border-box;
			display: flex;
			text-align: center;
			zIndex: 2;
			border-radius: 5px;
			transition: all 0.5s;
			overflow: hidden
		`
		this.innerHTML = '0'
	}
	overlay(exp)
	{
		this.style.padding = '0px'
		console.log(exp)
		if (!exp.value)
		{
			this.reset()
		}
		this.innerHTML = exp.value
		this.style.left = exp.getLeft() + 'px'
		this.style.width = exp.getWidth() + 'px'
	}
	reset()
	{
		this.style.left = '0px'
		this.style.width = '0px'
		this.style.padding = '0px'
	}
}


customElements.define("expression-elem", Exp)
customElements.define("exp-vis", ExpVis)
customElements.define("vis-elem", ExpVisElem)
