# jsExperiments
## Making the web feel alive one experiment at a time

### Use them!
These are all written in vanilla JS. Feel free to take the ones you like and use them for your own websites! Check out the index.html file for the example for each project (and sometimes the script.js file as well) to figure out how to put them on your own websites.

### Edit them! 
Please feel free to open issues and pull requests if you have any suggestions or changes you would like to make.

### Add your own experiments!
Also feel free to push your own expriments to the repository. The basic idea is to create new visual elements that are easy to plop into a web page and use out of the box. I personally find that custom elements are usually the easiest way to add an element to a web page, but also simple scripts that self mount/give an easy api to do some basic js are good too. Basically the elements should be as easy to use as just including a script tag and using the element, or be a single function to add a cool visual element (like changeFromDist).
### License/Use
It is licensed under the MIT license which means that you may use the software however you like but you must include the text from the LICENSE file in your project. If you take snippets from a javascript file please link (https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE) to the license as a comment above the snippet. If you contribute to the repository feel free to commit a MIT license to the directory that you contributed to, and add a commented link at the top of the file/snippet you contributed to, just to give yourself credit as well.
### To run: 
1. `npm install`
2. `npm start folderName` - Replace `folderName` with the name of the experiment you want to look at
3. in the browser of your choice go to http://localhost:2000
* you can also cd into the folder that you want to look at and run `npm start`
### List of folders to check out / contribute to
* [`starterTemplate`](https://zphyrj.github.io/jsExperiments/starterTemplate) - if you want to make another project copy all the files in here and paste them in a new folder.
* [`boids`](https://zphyrj.github.io/jsExperiments/boids) - a flocking simulation that uses webGL 1.0 to calculate the direction of each boid with a compute shader.
* [`bubble`](https://zphyrj.github.io/jsExperiments/bubble) - taking the code from imgTransition for the clip path animation and the code from the modal query selector and making an element that clip paths whatever element specified, leaving everything else alone.
* [`changeFromDist`](https://zphyrj.github.io/jsExperiments/changeFromDist) - Runs an input function with the input element and a value between 0 and 1 depending on the distance between the mouse and the element, while the mouse is within the parent element of the input element. I made it to change css properties, but you can make the function do anything with the distance number.
* [`codebox`](https://zphyrj.github.io/jsExperiments/codebox) - a simple HTML custom element that lets you load and display code files without html messing with the code. (example code displayed is a decently fun pong game I wrote in C++, if you wanna copy and paste the code files and compile yourself).
* [`example`](https://zphyrj.github.io/jsExperiments/example) - An example, complete with a home page and a 404 page
* [`expVis`](https://zphyrj.github.io/jsExperiments/expVis) - Kind of buggy with equation parsing/ui needs work but the core vis is done. Take in expression and let user step through what steps JS would take to evaluate the expression.
* [`file upload`](https://zphyrj.github.io/jsExperiments/fileUpload) - A file uploader element. Lets you read the files with the `files` variable. People can click or drag and drop files to the element.
* [`imgTransition`](https://zphyrj.github.io/jsExperiments/imgTransition) - does a bubble of an image with clip path to make it look like the image is appearing. Check out the index.html file for the optional HTML attributes.
* [`modal`](https://zphyrj.github.io/jsExperiments/modal)  - WIP: a web component that takes in a query for a child element along with a couple of other parameters. Whatever object the query returns should be displayed like normal. Then on click of the element a modal opens (use the same modal for every instance of the web component mounted to the top of the body) and the modal should duplicate the innerHTML of the element. The modal should take the child element queried, get its width and height, set that to the modal width and height and make only the queried element displayed at first, position the modal so that the queried element in the modal lines up with the queried element on the page and then set the width and height to the default modal styling. It should basically look like the modal is expanding from below the element. It should do everything in reverse on the modal close
* [`pwaStarterTemplate`](https://zphyrj.github.io/jsExperiments/pwaStarterTemplate) - WIP: The bare minimum to let people install your website.
* [`scroller`](https://zphyrj.github.io/jsExperiments/scroller) - (kinda finished) A smooth UI for a flexbox container that takes up as much space as possible on the page without having to scroll to see the whole element(width 100%, height 100%) while still having a way to advance to the next slide -- good example of flexbox, position: sticky, clip-path, and changing css with html. TODO: make it into a web module, including having all the required css within the module class
