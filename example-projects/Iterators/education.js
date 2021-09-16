import ListIterator from "./ListIterator.js";
let Education = function(data) {
    let gradYearElem = document.getElementById("grad-year");
    let schoolNameElem = document.getElementById("school-name");
    let addBtn = document.getElementById("education-add");
    let listContainer = document.getElementById("education-list");
    let arr = [];
    if (data) {
        setData(data);
    }
    addBtn.addEventListener("click", add);
    // sorts descending by grad year using iterator
    function add() {
        let gradYear = Number.parseInt(gradYearElem.value);
        let schoolName = schoolNameElem.value;
        if (!gradYear || !schoolName) {
            alert("Please enter a valid school name and graduation year.");
            return;
        }
        let iter = new ListIterator(arr);
        let obj = {
            gradYear: gradYear,
            schoolName: schoolName
        };
        let added = false;
        while (iter.hasNext()) {
            let next = iter.next();
            if (next.gradYear > gradYear) {
                iter.previous();
                iter.add(obj);
                added = true;
                break;
            }
        }
        !added && iter.add(obj); // if not added, add to end
        schoolNameElem.value = "";
        gradYearElem.value = "";
        refreshDom();
    }
    function setData(data) {
        arr = data;
        refreshDom();
    }
    function refreshDom() {
        function remove(obj) {
            let iter = new ListIterator(arr);
            while (iter.hasNext()) {
                let next = iter.next();
                if (next.gradYear === obj.gradYear && next.schoolName === obj.schoolName) {
                    iter.previous();
                    iter.remove();
                    refreshDom();
                    return;
                }
            }
            throw new Error("Object not found");
        }
        let listIter = new ListIterator(arr);
        listContainer.innerHTML = "";
        while (listIter.hasNext()) {

            let next = listIter.next();
            let edElem = document.createElement("div");
            let removeBtn = document.createElement("button");
            removeBtn.type = "button";
            edElem.innerHTML = `<smooth-placeholder-input value=${next.gradYear} name="grad-year" id="grad-year" step="1" placeholder="Year" class="host"></smooth-placeholder-input>
            <smooth-placeholder-input type="text" value=${next.schoolName} name="school-name" id="school-name" placeholder="School Name" class="host"></smooth-placeholder-input>`;
            removeBtn.innerHTML = "X";
            removeBtn.className = "remove-btn";
            edElem.appendChild(removeBtn);
            listContainer.appendChild(edElem);
            removeBtn.addEventListener("click", ()=>remove(next));
        }
    }

    return {
        arr: arr
    }
}
export default Education;