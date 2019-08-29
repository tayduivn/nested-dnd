// flatten a nested object to dot notation
export default function flatten(object) {
	const result = {};

	function flatten(obj, prefix = "") {
		let key;
		for (key in obj) {
			let value = obj[key];
			if (typeof value === "object") {
				flatten(value, `${prefix}${key}.`);
			} else {
				result[`${prefix}${key}`] = value;
			}
		}
	}

	flatten(object);

	return result;
}
