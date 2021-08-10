// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

export default class fileUpload extends HTMLElement {
	/**
	 * @param onDrop - function to call when file is dropped
	 * @param onError - function to call when file is not valid
	 * @param fileTypes - array of file types to accept
	 * @todo allow uploading of folder; store each folder as json in files list
	 * */
	constructor(onDrop=()=>{}, onError=()=>{}, fileExts=null, showUploaded=false) {
		super();
		this.root = this;
		this.onDrop = onDrop;
		this.onError = onError;
		this.fileExts = fileExts;
		this.showUploaded = showUploaded;
		this.files = [];
	}
	_onDrop(e)
	{
		console.log('here');
		this.classList.toggle('dragover', false);
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.items)
		{
			for (let i = 0; i < e.dataTransfer.items.length; i++)
			{
				let item = e.dataTransfer.items[i];
				if (item.kind === 'file')
				{
					let file = item.getAsFile();
					this.addFile(file);
				}
			}
		}
		else
		{
			let files = e.dataTransfer.files;
			for (let i = 0; i < files.length; i++)
			{
				let file = files[i];
				this.addFile(file);
			}
		}
		this.onDrop();
	}
	_onError(file)
	{
		this.onError();
		this.classList.toggle('error', true)
	}
	addFile(file)
	{
		const fileExt = file.name.slice(file.name.lastIndexOf('.')+1) || file.name;
		if (this.fileExts && this.fileExts.indexOf(fileExt) === -1)
		{
			this._onError(file);
			this.dispatchEvent(new CustomEvent('file-error', {detail: file}));
			return;
		}
		this.files.push(file);
		const fileName = document.createElement('div');
		fileName.appendChild(document.createTextNode(file.name));
		fileName.className = 'file-name';
		this.showUploaded && this.fileNameDiv.appendChild(fileName);
	}
	clearFiles()
	{
		this.files = [];
		if (this.showUploaded) this.fileNameDiv.innerHTML = '';
	}
	connectedCallback()
	{
		this.showUploaded = this.getAttribute('show-uploaded') !== null;
		this.fileExts = this.getAttribute('file-exts');
		if (this.fileExts)
		{
			this.fileExts = JSON.parse(this.fileExts);
		}
		this.classList.add('drop-area');
		this.addEventListener('drop', this._onDrop.bind(this));
		let startDragOver = (e) => {
			e.preventDefault();
			this.classList.toggle('dragover', true);
		}
		this.addEventListener('dragenter', startDragOver);
		let stopDragOver = (e) => {
			e.preventDefault();
			this.classList.toggle('dragover', false);
		}
		this.addEventListener('dragleave', stopDragOver);
		this.addEventListener('dragend', stopDragOver);
		this.addEventListener('dragover', startDragOver);
		this.fileInput = document.createElement('input');
		this.fileInput.multiple = true;
		// this.fileInput.setAttribute('directory', '')
		// this.fileInput.setAttribute('webkitdirectory', '');
		// this.fileInput.setAttribute('mosdirectory', '');

		this.fileInput.type = 'file';
		this.fileInput.multiple = true;
		this.fileInput.addEventListener('change', () =>
		{
			this.clearFiles();
			Array.from(this.fileInput.files).forEach((file) =>
			{
				this.addFile(file);
			});
			this.onDrop();
		});
		const label = document.createElement('label');
		label.appendChild(this.fileInput);

		if (this.showUploaded)
		{
			this.fileNameDiv = document.createElement('div');
			this.fileNameDiv.className = 'file-names';
			label.appendChild(this.fileNameDiv);
		}
		this.appendChild(label);
	}
}
customElements.define('file-upload', fileUpload);