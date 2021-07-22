import generateExElems from "./modules/generateExElems.js";
// import changeFromDist, {newFrame, reset} from "./modules/changeFromDistVis.js";
import changeFromDist, {reset} from "./modules/changeFromDist.js";
window.onload = function() {
    let parent = generateExElems(5, 5);
    document.body.appendChild(parent);
    let parentPosOnDocument = {x: parent.getBoundingClientRect().left + document.documentElement.scrollLeft, y: parent.getBoundingClientRect().top + document.documentElement.scrollTop};
    // iterate through the parent's children
    function changeEachChildsColorOnMouseMove(event) {
        event.pageX;
        event.pageY;
        console.log(event.offsetX, event.pageX-parentPosOnDocument.x, event.pageY - parentPosOnDocument.y);
        // newFrame(parent);
        for (let i = 0; i < parent.children.length; i++) {
            changeFromDist(parent.children[i], [{x:event.pageX-parentPosOnDocument.x, y:event.pageY - parentPosOnDocument.y}], setHue);
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
    // listen for mousemove events on the parent
    parent.addEventListener("pointermove", changeEachChildsColorOnMouseMove)
    parent.addEventListener("pointerdown", changeEachChildsColorOnMouseMove)

    // parent.addEventListener("pointerend", resetElems);
    resetElems();
}
// take in the element and a number between 0 and 1 and set the hue component accordingly
function setHue(element, hue) {
    // element.style.filter = `brightness(${1-hue})`;
    element.innerHTML=Math.round(100-hue*100)/100;
    element.style.backgroundColor = `hsl(${245+hue * 90}deg, 100%, 50%)`;
    // convert hsl to rgb - https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
    function hslToRgb(h,s,l) 
    {
        let a= s*Math.min(l,1-l);
        let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
        return [f(0),f(8),f(4)];
    }
    let rgb = hslToRgb((245 + hue * 90), 1, .5).map(e=>e*255);
    let textCol = rgb.reduce((prev, curr) => prev + curr)/3 < 255/2 ? "#fff" : "#000";
    element.style.color = textCol;
}