/**
 * 
 * @param {HTMLElement} elemToChange 
 * @param {Array: Number} mousePos 
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
			x: mousePos.x - parentBox.left, 
			y: mousePos.y - parentBox.top
		}
		return parentPos;
	}
	function getDistFromMouseToElem()
	{
		let parentPos = getMousePosRelativeToElemParent()
		Math.sqrt(Math.pow((elemToChange.offsetTop + elemToChange.offsetLeft/2) - parentPos.y, 2)+Math.pow((elemToChange.offsetLeft + elemToChange.offsetHeight) - parentPos.x, 2))
	}
	maxDist = Math.sqrt(Math.pow(parent.offsetWidth, 2)+Math.pow(parent.offsetHeight, 2));
	const distPerc = getDistFromMouseToElem()/maxDist;
	if (!changeFunct)
	{
		return maxDist;
	}
	changeFunct(elemToChange,);
}