
import Education from './education.js';
import JobInfo from './jobInfo.js';
document.addEventListener('DOMContentLoaded', function(e) {
    let ed = Education();
    let job = JobInfo();
    let submit = document.getElementById('submit');
    let resume = document.getElementById('resume');
    let form = document.getElementById('form');
    let showFormBtn = document.getElementById('toggle-form');
    showFormBtn.addEventListener('click', function(e) {
        form.classList.toggle('hidden');
        resume.classList.toggle("maximum");
    });
    submit.addEventListener('click', function(e) {
        e.preventDefault();
        let name = document.getElementById('name').value;
        let email = document.getElementById('email').value;
        let jobs = job.arr;
        let educations = ed.arr;
        resume.innerHTML = `<h1>${name}</h1>
        <h2>${email}</h2>
        <h3>Education</h3>
        <ul>
        ${educations.map(function(item) {
            return `<li>${item.gradYear} - ${item.schoolName}</li>`;
        }
        ).join('')}
        </ul>
        <h3>Work Experience</h3>
        <ul>
        ${jobs.map(function(item) {
            return `<li>${item.jobYear} - ${item.jobTitle} at ${item.companyName}</li>`;
        }
        ).join('')}
        </ul>`;
        form.parentElement.prepend
    });
});