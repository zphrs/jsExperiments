// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

import generateExElems from "./modules/generateExElems.js";
import changeFromDist, {reset} from "./modules/changeFromDist.js";
import changeFromDistVis, {resetVis, newFrame} from "./modules/changeFromDistVis.js";
// first demo with the visualization
window.addEventListener('load', function() {
    let parent = generateExElems(5, 5);
    document.body.appendChild(parent);
    let parentPosOnDocument = {x: parent.getBoundingClientRect().left + document.documentElement.scrollLeft, y: parent.getBoundingClientRect().top + document.documentElement.scrollTop};
    // iterate through the parent's children
    let touches = {}
    function storeEachTouch(event)
    {
        touches[event.pointerId] = ({x:event.pageX-parentPosOnDocument.x, y:event.pageY - parentPosOnDocument.y});
        changeEachChildsColorOnMouseMove(Object.keys(touches).map(key=>touches[key]));
    }
    function removeTouch(event)
    {
        delete touches[event.pointerId];
        resetElems()
    }
    function changeEachChildsColorOnMouseMove(touches) {
        // console.log(event.offsetX, event.pageX-parentPosOnDocument.x, event.pageY - parentPosOnDocument.y);
        newFrame(parent);
        for (let i = 0; i < parent.children.length; i++) {
            changeFromDistVis(parent.children[i], touches, setHue);
        }
    }
    function resetElems()
    {
        for (let i = 0; i < parent.children.length; i++) {
            resetVis(parent.children[i], setHue, .5);
        }
        console.log("reset");
        newFrame(parent);
    }
    // listen for mousemove events on the parent
    parent.addEventListener("pointermove", storeEachTouch)
    parent.addEventListener("pointerdown", storeEachTouch)
    // parent.addEventListener("pointerup", removeTouch)
    parent.addEventListener("pointerleave", removeTouch)
    parent.addEventListener("pointerout", removeTouch)
    parent.addEventListener("pointercancel", removeTouch)
    resetElems();
})
// second demo without the visualization
window.addEventListener('load', function() {
    let parent = generateExElems(5, 5);
    document.body.appendChild(parent);
    let parentPosOnDocument = {x: parent.getBoundingClientRect().left + document.documentElement.scrollLeft, y: parent.getBoundingClientRect().top + document.documentElement.scrollTop};
    let touches = {}
    function storeEachTouch(event)
    {
        touches[event.pointerId] = ({x:event.pageX-parentPosOnDocument.x, y:event.pageY - parentPosOnDocument.y});
        changeEachChildsColorOnMouseMove(Object.keys(touches).map(key=>touches[key]));
    }
    function removeTouch(event)
    {
        delete touches[event.pointerId];
        resetElems()
    }
    function changeEachChildsColorOnMouseMove(touches) {
        // newFrame(parent);
        for (let i = 0; i < parent.children.length; i++) {
            // changeFromDistVis(parent.children[i], touches, setHue);
            changeFromDist(parent.children[i], touches, setHue);
        }
    }
    function resetElems()
    {
        for (let i = 0; i < parent.children.length; i++) {
            // resetVis(parent.children[i], setHue, .5);
            reset(parent.children[i], setHue, .5);
        }
        console.log("reset");
        // newFrame(parent);
    }
    // Will trigger the event when the pointer stops registering any pointermove event. Ex. when mouse leaves element, when finger is realeased, or pen is out of hover range.
    parent.addEventListener("pointermove", storeEachTouch)
    parent.addEventListener("pointerdown", storeEachTouch)
    parent.addEventListener("pointerleave", removeTouch)
    parent.addEventListener("pointerout", removeTouch)
    parent.addEventListener("pointercancel", removeTouch)
    resetElems();
})
// third demo that tests max element counts/efficiency
window.addEventListener('load', function() {
    function setHue(element, hue) {
        element.style.backgroundColor = `hsl(${hue * 90-45}deg, 100%, 50%)`;
    }
    let parent = generateExElems(50, 50);
    parent.style.gridGap = '0';
    document.body.appendChild(parent);
    let parentPosOnDocument = {x: parent.getBoundingClientRect().left + document.documentElement.scrollLeft, y: parent.getBoundingClientRect().top + document.documentElement.scrollTop};
    let touches = {}
    function storeEachTouch(event)
    {
        touches[event.pointerId] = ({x:event.pageX-parentPosOnDocument.x, y:event.pageY - parentPosOnDocument.y});
        changeEachChildsColorOnMouseMove(Object.keys(touches).map(key=>touches[key]));
    }
    function removeTouch(event)
    {
        delete touches[event.pointerId];
        resetElems()
    }
    function changeEachChildsColorOnMouseMove(touches) {
        // newFrame(parent);
        for (let i = 0; i < parent.children.length; i++) {
            changeFromDist(parent.children[i], touches, setHue);
        }
    }
    function resetElems()
    {
        for (let i = 0; i < parent.children.length; i++) {
            reset(parent.children[i], setHue, .5);
        }
        console.log("reset");
        // newFrame(parent);
    }
    // Will trigger the event when the pointer stops registering any pointermove event. Ex. when mouse leaves element, when finger is realeased, or pen is out of hover range.
    parent.addEventListener("pointermove", storeEachTouch)
    parent.addEventListener("pointerdown", storeEachTouch)
    parent.addEventListener("pointerleave", removeTouch)
    parent.addEventListener("pointerout", removeTouch)
    parent.addEventListener("pointercancel", removeTouch)
    resetElems();
})
// take in the element and a number between 0 and 1 and set the hue component accordingly
function setHue(element, hue) {
    element.innerHTML=Math.round(100-hue*100)/100;
    element.style.backgroundColor = `hsl(${245+hue * 90}deg, 100%, 50%)`;
    // convert hsl to rgb - https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex/54014428#54014428
    let rgb = hslToRgb((245 + hue * 90), 1, .5).map(e=>e*255);
    let textCol = rgb.reduce((prev, curr) => prev + curr)/3 < 255/2 ? "#fff" : "#000";
    element.style.color = textCol;
}
function hslToRgb(h,s,l) 
{
    let a= s*Math.min(l,1-l);
    let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
    return [f(0),f(8),f(4)];
}