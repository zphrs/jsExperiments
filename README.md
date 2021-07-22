# jsExperiments
## Making the web feel alive one experiment at a time
### To run: 
1. `npm install`
2. `npm start folderName` - Replace `folderName` with the name of the experiment you want to look at
3. in the browser of your choice go to http://localhost:2000
* you can also cd into the folder that you want to look at and run `npm start`
### List of folders to check out / contribute to
* [`starterTemplate`](https://zphyrj.github.io/starterTemplate.html) - if you want to make another project copy all the files in here and paste them in a new folder.
* [`bubble`](https://zphyrj.github.io/bubble.html) - taking the code from imgTransition for the clip path animation and the code from the modal query selector and making an element that clip paths whatever element specified, leaving everything else alone.
* [`changeFromDist`](https://zphyrj.github.io/changeFromDist.html) - Runs an input function with the input element and a value between 0 and 1 depending on the distance between the mouse and the element, while the mouse is within the parent element of the input element. I made it to change css properties, but you can make the function do anything with the distance number.
* [`example`](https://zphyrj.github.io/example.html) - An example, complete with a home page and a 404 page
* [`expVis`](https://zphyrj.github.io/expVis.html) - Kind of buggy with equation parsing/ui needs work but the core vis is done. Take in expression and let user step through what steps JS would take to evaluate the expression.
* [`imgTransition`](https://zphyrj.github.io/imgTransition.html) - does a bubble of an image with clip path to make it look like the image is appearing. Check out the index.html file for the optional HTML attributes.
* [`modal`](https://zphyrj.github.io/modal.html)  - WIP: a web component that takes in a query for a child element along with a couple of other parameters. Whatever object the query returns should be displayed like normal. Then on click of the element a modal opens (use the same modal for every instance of the web component mounted to the top of the body) and the modal should duplicate the innerHTML of the element. The modal should take the child element queried, get its width and height, set that to the modal width and height and make only the queried element displayed at first, position the modal so that the queried element in the modal lines up with the queried element on the page and then set the width and height to the default modal styling. It should basically look like the modal is expanding from below the element. It should do everything in reverse on the modal close
* [`scroller`](https://zphyrj.github.io/scroller.html) - (kinda finished) A smooth UI for a flexbox container that takes up as much space as possible on the page without having to scroll to see the whole element(width 100%, height 100%) while still having a way to advance to the next slide -- good example of flexbox, position: sticky, clip-path, and changing css with html. TODO: make it into a web module, including having all the required css within the module class
