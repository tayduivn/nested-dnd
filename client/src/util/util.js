import tableStore from '../stores/tableStore.js';

Array.prototype.roll = function(){ // eslint-disable-line
	var result = choose(this);

	//termination condition: no roll function;
	return tableStore.roll(result);
}

Array.prototype.equals = function (array) { // eslint-disable-line
		// if the other array is a falsy value, return
		if (!array)
				return false;

		// compare lengths - can save a lot of time 
		if (this.length !== array.length)
				return false;

		for (var i = 0, l=this.length; i < l; i++) {
				// Check if we have nested arrays
				if (this[i] instanceof Array && array[i] instanceof Array) {
						// recurse into the nested arrays
						if (!this[i].equals(array[i]))
								return false;       
				}           
				else if (this[i] !== array[i]) { 
						// Warning - two different object instances will never be equal: {x:20} != {x:20}
						return false;   
				}           
		}       
		return true;
}

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false}); // eslint-disable-line

Math.rand = function(min,max){// eslint-disable-line
	//Return a number between min and max, included.
	return parseFloat(Math.floor(Math.random()*(max-min+1)))+parseFloat(min);
}

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

function choose(arr){
	//Returns an element from an array at random.
	var result = arr[Math.floor(Math.random()*arr.length)];

	if(result.value)
		result = result.value;
	return result;
}

function weightedChoose(arr,weightChoose){
	//Returns an element from an array at random according to a weight.
	//A weight of 2 means the first element will be picked roughly twice as often as the second; a weight of 0.5 means half as often. A weight of 1 gives a flat, even distribution.
	if (weightChoose<=0 || weightChoose===undefined) weightChoose=1;
	var result = arr[Math.floor(Math.pow(Math.random(),weightChoose)*arr.length)];
	
	if(result.value)
		result = result.value;
	return result;
}

function weightedDiceChoose(arr){
	if(!(arr instanceof Array)){
		throw  new Error("arr must be instanceof Array");
	}

	var dSize = 0;
	var percentages = [];
	var value, weight;
	var row;

	arr = arr.slice();

	//sum weights
	for(var i = 0; i < arr.length; i++){
		row = arr[i];
		if(row.weight){
			value = row.value;
			weight = row.weight;
		}else if(typeof row === "string"){
			var parts = row.split(",");
			value = parts[0];
			weight = (parts[1]) ? parseInt(parts[1],10) : 1;
		}else{
			value = row;
			weight = 1;
		}

		dSize+= weight;
		percentages.push(weight);
		arr[i] = value;
	}
	var threshold = 0;
	var dRoll = Math.rand(1,dSize);
	
	for(i = 0; i < percentages.length; i++){
		threshold+= percentages[i];
		if(dRoll <= threshold){
			return arr[i];
		}
	}
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



export {uniq,choose,weightedChoose,weightedDiceChoose,copyToClipboard,binaryFind,clean,valueIsUndefined,downloadJSON}