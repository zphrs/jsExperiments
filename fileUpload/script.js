// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
window.addEventListener('load', e => {
	const uploader = document.querySelector('file-upload');
	let processedFiles = [];
	uploader.onDrop = () => {
		console.log(uploader.files);
	}
	uploader.addEventListener('file-error' , e => {
		console.log(e.detail.name, "file blocked");
	});
	console.log(uploader.onDrop);
	const processBtn = document.getElementById('process')
	processBtn.addEventListener('click', e => {
		processedFiles = [...uploader.files]
		console.log(processedFiles);
		uploader.clearFiles();
		processedFiles.forEach(file => {
			const fileName = document.createElement('p');
			fileName.appendChild(document.createTextNode(file.name));
			document.body.appendChild(fileName);
		});
	})
});