// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

/**
 * 
 * @param {HTMLElement} elemToChange
 * @param {Array<{x:Number, y:Number}>} mousePos The position of the mouse relative to the document (event.pageX)
 * @param {function(HTMLElement, Number)} changeFunct 
 * @returns {[Number, HTMLElement]} distance, parentPos
 * @description It will call the function changeFunct with the element and the amount of change.
 */
export default function changeFromDist(elemToChange, mousePos, changeFunct)
{
	const parent = elemToChange.parentElement
    let parentPosOnDocument = {x: parent.getBoundingClientRect().left + document.documentElement.scrollLeft, y: parent.getBoundingClientRect().top + document.documentElement.scrollTop};
	// mousePos = {x:mousePos.x - parentPosOnDocument.x, y: mousePos.y - parentPosOnDocument.y};
	mousePos = mousePos.map((pos) => {return {x:pos.x - parentPosOnDocument.x, y: pos.y - parentPosOnDocument.y}})
	parent.style.position = 'relative'
	function getDist(x, y)
	{
		return Math.sqrt(Math.pow((elemToChange.offsetTop + elemToChange.offsetHeight/2) - y, 2)+Math.pow((elemToChange.offsetLeft + elemToChange.offsetWidth/2) - x, 2))
	}
	function getMinDist()
	{
		return Math.min(...([...mousePos].map(e=>
		{
			return getDist(e.x, e.y)
		})))
	}
	let maxDist = Math.sqrt(Math.pow(parent.clientWidth, 2)+Math.pow(parent.clientHeight, 2));
	const distPerc = getMinDist()/maxDist;
	if (!changeFunct)
	{
		return maxDist;
	}
	changeFunct && changeFunct(elemToChange, distPerc);
	return distPerc;
}
export function reset(elementToChange, changeFunct, val)
{
	changeFunct(elementToChange, val??.5);
}