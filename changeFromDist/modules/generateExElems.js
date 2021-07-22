// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE


/**
 * returns parent element with all the example divs inside
 *
*/
export default function generateExElems(rowCt, colCt, elemToDup)
{
	let parent = document.createElement('div')
	// set parent class
	parent.className = 'ex-elems'
	// generate a css grid w/ the number of rows and columns specified
	parent.style.display = 'grid'
	console.log(Array.from(Array(rowCt).keys()).map(()=>1 + 'fr'))
	parent.style.gridTemplateColumns = Array.from(Array(rowCt).keys()).map(()=>1 + 'fr').join(' ')
	parent.style.gridTemplateRows = Array.from(Array(colCt).keys()).map(()=>1 + 'fr').join(' ')
	// generate a div for each row and column
	for (let i = 0; i < rowCt; i++)
	{
		for (let j = 0; j < colCt; j++)
		{
			let elem = elemToDup?elemToDup.cloneNode(true):document.createElement('div')
			parent.appendChild(elem)
		}
	}
	return parent;
}