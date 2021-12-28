import stackItem from "./StackItem.js";

export default class Stack {

	constructor() {
		this.top = null;
	}

	empty() {
		return this.top === null;
	}

	peek() {
		return this.top.item;
	}

	push(item) {
		this.top = new stackItem(item, this.top);
	}

	pop() {
		if (!this.top) {
			throw new Error("Stack is empty");
		}
		let item = this.top.value;
		this.top = this.top.next;
		return item;
	}
}