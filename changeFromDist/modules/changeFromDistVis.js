import changeFromDist, {reset} from "./changeFromDist.js";
/**
 * Extends cangeFromDist to visualize the algorithm with a js canvas.
 * TODO: make changeFromDistVis work with multiple touch points
 */
export default function changeFromDistVis(elemToChange, mousePos, changeFunct) {
    const parent = elemToChange.parentElement;
    let canvas = parent.querySelector('.canvas-vis')
    if (!canvas) {
        throw new Error('run newFrame before running changeFromDistVis');
    }
    if (canvas === elemToChange)
    {
        return;
    }
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1 - changeFromDist(elemToChange, mousePos, changeFunct);
    mousePos = mousePos[0]
    // listen to resize events
    function drawVis()
    {
        // draw line from mousePos to elemToChange center
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(Math.min(elemToChange.clientHeight, elemToChange.clientWidth) / 50, 1);
        ctx.beginPath();
        ctx.moveTo(mousePos.x, mousePos.y);
        ctx.lineTo(elemToChange.offsetLeft + elemToChange.offsetWidth / 2, elemToChange.offsetTop + elemToChange.offsetHeight / 2);
        // clear canvas
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    }
    drawVis();

}
export function newFrame(parent) {
    let canvas = parent.querySelector('.canvas-vis')
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.classList.add('canvas-vis');
        parent.style.position = 'relative';
        canvas.style.position = 'absolute';
        canvas.style.overflow = 'hidden';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.mixBlendMode = 'difference';
        canvas.style.backgroundColor = 'transparent'
        parent.appendChild(canvas);
    }
    const style = window.getComputedStyle(parent)

    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight - 1;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log('cleared canvas')
}
export function resetVis(elemToChange, changeFunct, val)
{
    const parent = elemToChange.parentElement;
    if (elemToChange !== parent.querySelector('.canvas-vis'))
    {
        reset(elemToChange, changeFunct, val)
    }
}