function setAverageColor() {
  // get computed style on the html element
  var htmlStyle = window.getComputedStyle(document.documentElement);

  // get the --primary-color value
  var primaryColor = parseColor(htmlStyle.getPropertyValue("--primary-color"));
  var secondaryColor = parseColor(htmlStyle.getPropertyValue("--secondary-color"));
  var accentColor = parseColor(htmlStyle.getPropertyValue("--accent-color"));
  // average the colors
  var averageColor = [
    (primaryColor[0]*.6 + secondaryColor[0]*.3 + accentColor[0]*.1),
    (primaryColor[1]*.6 + secondaryColor[1]*.3 + accentColor[1]*.1),
    (primaryColor[2]*.6 + secondaryColor[2]*.3 + accentColor[2]*.1)
  ];
  const avgStr = `rgb(${averageColor[0]}, ${averageColor[1]}, ${averageColor[2]})`;
  document.documentElement.style.setProperty("--average-color", avgStr);
};

function parseColor(input) {
  var div = document.createElement("div"),
    m;
  div.style.color = input;
  document.body.appendChild(div);
  m = getComputedStyle(div).color.match(
    /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
  );
  document.body.removeChild(div);
  if (m) return [m[1], m[2], m[3]];
  else throw new Error("Colour " + input + " could not be parsed.");
}

window.onload = function() {
  

    // listen to changes in css variables using MutationObserver
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === "style") {
          const style = mutation.target.style;
          const primaryColor = style.getPropertyValue("--primary-color");
          const secondaryColor = style.getPropertyValue("--secondary-color");
          const accentColor = style.getPropertyValue("--accent-color");
          const primaryElement = document.querySelector("#primary-color");
          const secondaryElement = document.querySelector("#secondary-color");
          const accentElement = document.querySelector("#accent-color");
          primaryElement.innerHTML = primaryColor;
          secondaryElement.innerHTML = secondaryColor;
          accentElement.innerHTML = accentColor;
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"]
    });


  var htmlStyle = window.getComputedStyle(document.documentElement);
  const primarySelector = document.querySelector("#primary");
  const secondarySelector = document.querySelector("#secondary");
  const accentSelector = document.querySelector("#accent");

  // check the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const primaryColor = urlParams.get("primary");
  const secondaryColor = urlParams.get("secondary");
  const accentColor = urlParams.get("accent");

  // if there are no query parameters, use the default colors
  if (primaryColor) {
    localStorage.setItem("primary-color", primaryColor);
  }
  if (secondaryColor) {
    localStorage.setItem("secondary-color", secondaryColor);
  }
  if (accentColor) {
    localStorage.setItem("accent-color", accentColor);
  }

  // set the initial colors
  // remove starting and ending spaces
  primarySelector.value = htmlStyle.getPropertyValue("--primary-color").trim();
  secondarySelector.value = htmlStyle.getPropertyValue("--secondary-color").trim();
  accentSelector.value = htmlStyle.getPropertyValue("--accent-color").trim();

  // add listeners
  primarySelector.addEventListener("input", function() {
    document.documentElement.style.setProperty("--primary-color", this.value);
    setAverageColor();
    localStorage.setItem("primary-color", this.value);
  })
  secondarySelector.addEventListener("input", function() {
    document.documentElement.style.setProperty("--secondary-color", this.value);
    setAverageColor();
    localStorage.setItem("secondary-color", this.value);
  })
  accentSelector.addEventListener("input", function() {
    document.documentElement.style.setProperty("--accent-color", this.value);
    setAverageColor();
    localStorage.setItem("accent-color", this.value);
  })

  // check for local storage
  if (localStorage.getItem("primary-color")) {
    primarySelector.value = localStorage.getItem("primary-color");
    document.documentElement.style.setProperty("--primary-color", primarySelector.value);
  }

  if (localStorage.getItem("secondary-color")) {
    secondarySelector.value = localStorage.getItem("secondary-color");
    document.documentElement.style.setProperty("--secondary-color", secondarySelector.value);
  }

  if (localStorage.getItem("accent-color")) {
    accentSelector.value = localStorage.getItem("accent-color");
    document.documentElement.style.setProperty("--accent-color", accentSelector.value);
  }

  window.addEventListener("storage", event=>{
    if (event.key === "primary-color") {
      primarySelector.value = event.newValue;
      document.documentElement.style.setProperty("--primary-color", primarySelector.value);
    }
    if (event.key === "secondary-color") {
      secondarySelector.value = event.newValue;
      document.documentElement.style.setProperty("--secondary-color", secondarySelector.value);
    }
    if (event.key === "accent-color") {
      accentSelector.value = event.newValue;
      document.documentElement.style.setProperty("--accent-color", accentSelector.value);
    }
  })


  setAverageColor();
}
