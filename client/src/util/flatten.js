import isObject from "util/isObject";

// flatten a nested object to dot notation
export default function flatten(object) {
	const result = {};

	function flatten(obj, prefix = "") {
		let key;
		for (key in obj) {
			let value = obj[key];

			// we have to check if value is truthy, because `null` is an object
			if (isObject(value)) {
				flatten(value, `${prefix}${key}.`);
			} else {
				result[`${prefix}${key}`] = value;
			}
		}
	}

	flatten(object);

	return result;
}
