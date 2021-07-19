/**
 * 
 * @param {HTMLElement} elemToChange
 * @param {Array: Number} mousePos {x, y}
 * @param {function(element, amountToChange)} changeFunct 
 * @returns {Number} The distance between the mouse and the element divided by the distance between
 */
export default function changeFromDist(elemToChange, mousePos, changeFunct)
{
	const parent = elemToChange.parentElement
	function getMousePosRelativeToElemParent()
	{
		const parentBox = parent.getBoundingClientRect();
		const parentPos = {
			x: mousePos.x, 
			y: mousePos.y
		}
		return parentPos;
	}
	function getDistFromMouseToElem()
	{
		let parentPos = getMousePosRelativeToElemParent()
		return Math.sqrt(Math.pow((elemToChange.offsetTop + elemToChange.offsetHeight/2) - parentPos.y, 2)+Math.pow((elemToChange.offsetLeft + elemToChange.offsetWidth/2) - parentPos.x, 2))
	}
	let maxDist = Math.sqrt(Math.pow(parent.offsetWidth, 2)+Math.pow(parent.offsetHeight, 2));
	const distPerc = getDistFromMouseToElem()/maxDist;
	if (!changeFunct)
	{
		return maxDist;
	}
	changeFunct(elemToChange, distPerc);
}