class ExpVisModule extends HTMLElement {
	constructor() {
		super()
		window.addEventListener('load', e=>{
			this.shadow = this.attachShadow({mode:'open'})
			this.exp = document.createElement('p')
			this.exp.innerHTML = this.innerHTML
			this.shadow.appendChild(this.exp)
			
			this.evalBtn = document.createElement("button");
			this.evalBtn.innerHTML = "Evaluate"
			this.shadow.appendChild(this.evalBtn)

			this.style = document.createElement('style')
			this.style.innerHTML = `
			.
			`
			this.shadow.appendChild()
			
			console.log(this.innerHTML)
		})
	}

}

customElements.define("exp-vis", ExpVisModule)