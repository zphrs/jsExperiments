import generateExElems from "./modules/generateExElems.js";
import changeFromDist from "./modules/changeFromDist.js";
window.onload = function() {
    let parent = generateExElems(5, 5);
    // iterate through the parent's children
    function changeEachChildsColorOnMouseMove(event) {
        for (let i = 0; i < parent.children.length; i++) {
            changeFromDist(parent.children[i], {x:event.clientX, y:event.clientY}, setHue);
        }
        changeFromDist(parent, {x:event.clientX, y:event.clientY}, setBrightness);
    }
    // listen for mousemove events on the parent
    parent.addEventListener("pointermove", changeEachChildsColorOnMouseMove)
}
// take in the element and a number between 0 and 1 and set the hue component accordingly
function setHue(element, hue) {
    element.style.backgroundColor = `hsl(${hue * 90+270}deg, 100%, 50%)`;
    element.style.filter = `opacity(${1-hue})`;
}
function setBrightness(element, brightness)
{
    // 200% because only one element centered in the middle of the parent element.
    element.style.backgroundColor = `hsl(0deg, 0%, ${(brightness)*200}%)`;
}