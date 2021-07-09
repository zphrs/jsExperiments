# jsExperiments
## To run: 
1. `npm install`
2. `npm start folderName` - Replace `folderName` with the name of the experiment you want to look at
	- List of folders to check out / contribute to
		* `starterTemplate` - if you want to make another project copy all the files in here and paste them in a new folder.
		* `example` - An example, complete with a home page and a 404 page
		* `expVis` - WIP: make 
		* `modal`  - WIP: a web component that takes in a query for a child element along with a couple of other parameters. Whatever object the query returns should be displayed like normal, as though that element is the entire insides of the element. Then on click of the element a modal opens (use the same modal for every instance of the web component mounted to the top of the body) and the modal should duplicate the innerHTML of the element. The modal should take the child element queried, get its width and height, set that to the modal width and height and make only the queried element is displayed at first, position the modal so that the queried element in the modal lines up with the queried element on the page and then set the width and height to the default modal styling. It should basically look like the modal is expanding from below the element. It should do everything in reverse on the modal close
		* `scroller` - (kinda finished but also kinda still working on it) A smooth UI for a flexbox container that takes up as much space as possible on the page without having to scroll to see the whole element(width 100%, height 100%) while still having a way to advance to the next slide -- good example of flexbox, position: sticky, clip-path, and changing css with html. TODO: make it into a web module, including having all the required css within the module class
3. in the browser of your choice go to http://localhost:2000
## Other tips
* you can also cd into the folder that you want to look at and then run `npm start`