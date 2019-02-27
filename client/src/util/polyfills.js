// eslint-disable-next-line
Array.prototype.equals = function(array) {
	// eslint-disable-line
	// if the other array is a falsy value, return
	if (!array || this.length !== array.length) return false;

	for (var i = 0, l = this.length; i < l; i++) {
		// Check if we have nested arrays
		if (this[i] instanceof Array && array[i] instanceof Array) {
			// recurse into the nested arrays
			if (!this[i].equals(array[i])) return false;
		}
		// Warning - two different object instances will never be equal: {x:20} != {x:20}
		else if (this[i] !== array[i]) return false;
	}
	return true;
};

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false }); // eslint-disable-line
