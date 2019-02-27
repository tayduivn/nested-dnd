function isDifferent(a, b) {
	// array
	if (a instanceof Array && b instanceof Array) {
		let diff = false;

		// set length
		if (a.length !== b.length) {
			diff = true;
			a = [...a];
			a.length = b.length;
		}

		// loop items
		b.forEach((item, i) => {
			if (isDifferent(a[i], b[i])) {
				diff = true;
			} else {
				// put the original into the new array so that if the whole array is different this object
				// will still be the same
				b[i] = a[i];
			}
		});
		return diff;
	} else if (typeof a === "object" && typeof b === "object") {
		const newObj = spread(a, b);
		if (newObj !== a) {
			return true;
		}
	} else if (a !== b) {
		return true;
	}
	return false;
}

/**
 * Only changes the object if it changed.
 * @param  {[type]} into [description]
 * @param  {[type]} rest [description]
 * @return {[type]}      [description]
 */
export default function spread(into, ...rest) {
	let diff = false;
	let obj = { ...into };

	// combine all the rest into one object
	let combined = {};
	rest.forEach(o => (combined = { ...combined, ...o }));

	for (let key in combined) {
		if (isDifferent(obj[key], combined[key])) {
			diff = true;
			obj[key] = combined[key];
		} else {
			obj[key] = into[key];
		}
	}

	return diff ? obj : into;
}
