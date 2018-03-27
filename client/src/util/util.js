

Array.prototype.equals = function (array) { // eslint-disable-line
		// if the other array is a falsy value, return
		if (!array || this.length !== array.length)
				return false;

		for (var i = 0, l=this.length; i < l; i++) {
				// Check if we have nested arrays
				if (this[i] instanceof Array && array[i] instanceof Array) {
						// recurse into the nested arrays
						if (!this[i].equals(array[i])) return false;       
				} 
				// Warning - two different object instances will never be equal: {x:20} != {x:20}        
				else if (this[i] !== array[i]) return false;        
		}       
		return true;
}

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false}); // eslint-disable-line

function clean(obj) {
	Object.assign({},obj);
	for (var propName in obj) { 
		if (obj[propName] === undefined) {
			delete obj[propName];
		}
	}
	return obj;
}

// essentially makes up for the default values when constructing a thing
// need to know if value should be unset (set to undefined) in pack
function valueIsUndefined(value){
	return (value === undefined || value === false) ? true
				: (value === null) ? false // null means overwrite other packs to set this blank, or ignore isa value
				: (typeof value === "string") ? value === "" 
				: (value.constructor && value.constructor.name === "Array") ? value.equals([]) 
				: !Object.keys(value).length;
}

function downloadJSON(obj,filename) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", filename+".json");
	dlAnchorElem.click();
}

function copyToClipboard(text) {
	var textField = document.createElement('textarea')
	textField.innerText = text
	document.body.appendChild(textField)
	textField.select()
	document.execCommand('copy')
	textField.remove()
}

function uniq(a) {
	var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

	return a.filter(function(item) {
			var type = typeof item;
			if(type in prims)
					return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
			else
					return objs.indexOf(item) >= 0 ? false : objs.push(item);
	});
}

function binaryFind(arr, searchElement) {
	var minIndex = 0;
	var maxIndex = arr.length - 1;
	var currentIndex;
	var currentElement;

	while (minIndex <= maxIndex) {
		currentIndex = (minIndex + maxIndex) / 2 | 0;
		currentElement = arr[currentIndex];

		if (currentElement < searchElement) {
			minIndex = currentIndex + 1;
		}
		else if (currentElement > searchElement) {
			maxIndex = currentIndex - 1;
		}
		else {
			return { // Modification
				found: true,
				index: currentIndex
			};
		}
	}      

	return { // Modification
		found: false,
		index: currentElement < searchElement ? currentIndex + 1 : currentIndex
	};
}



export {uniq,copyToClipboard,binaryFind,clean,valueIsUndefined,downloadJSON}