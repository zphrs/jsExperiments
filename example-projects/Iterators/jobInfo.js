import ListIterator from "./ListIterator.js";
let JobInfo = function(data) {
    let jobYearElem = document.getElementById("job-year");
    let jobTitleElem = document.getElementById("job-title");
    let jobCompanyElem = document.getElementById("job-company");
    let addBtn = document.getElementById("job-add");
    let listContainer = document.getElementById("job-list");
    let arr = [];
    if (data) {
        setData(data);
    }
    addBtn.addEventListener("click", add);
    // sorts descending by grad year using iterator
    function add() {
        let jobYear = Number.parseInt(jobYearElem.value);
        let jobTitle = jobTitleElem.value;
        let companyName = jobCompanyElem.value;
        if (!jobYear || !jobTitle || !companyName) {
            alert("Please enter a valid job title, company, and year.");
            return;
        }
        let iter = new ListIterator(arr);
        let obj = {
            jobYear: jobYear,
            jobTitle: jobTitle,
            companyName: companyName
        };
        let added = false;
        while (iter.hasNext()) {
            let next = iter.next();
            if (next.jobYear > jobYear) {
                iter.previous();
                iter.add(obj);
                added = true;
                break;
            }
        }
        !added && iter.add(obj); // if not added, add to end
        jobTitleElem.value = "";
        jobYearElem.value = "";
        jobCompanyElem.value = "";
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
                if (next.jobYear === obj.jobYear && next.jobTitle === obj.jobTitle) {
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
            edElem.innerHTML = `<h3>${next.jobYear} - ${next.jobTitle} at ${next.companyName}</h3>`;
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
export default JobInfo;