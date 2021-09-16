document.addEventListener('DOMContentLoaded', function() {
    let displayBtn = document.getElementsByClassName('code-display-button')[0];
    displayBtn.addEventListener('click', function() {
        let code = document.getElementsByClassName('code-display-container')[0];
        code.style.display? code.style.display="" : code.style.display = 'none';
    }
    );
    displayBtn.click();
});