function share(e){
  // get the color codes from local storage
  var primaryColor = localStorage.getItem('primary-color');
  var secondaryColor = localStorage.getItem('secondary-color');
  var accentColor = localStorage.getItem('accent-color');
  
  // make a link with each color code as a query parameter
  var link = '?primary=' + encodeURIComponent(primaryColor) + '&secondary=' + encodeURIComponent(secondaryColor) + '&accent=' + encodeURIComponent(accentColor);
  // copy the link to the clipboard
  copyToClipboard(window.location.origin + window.location.pathname + link);
  const origText = e.target.innerText;
  e.target.innerText = 'Copied!';
  setTimeout(() => {
    e.target.innerText = origText;
  }, 1000);
}

window.addEventListener('load', function(){
  let shareButton = document.getElementById('share');
  shareButton.addEventListener('click', share);
});

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}