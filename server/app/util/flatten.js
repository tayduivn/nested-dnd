const isObject = require("./isObject");

// flatten a nested object to dot notation
module.exports = function flatten(object) {
	const result = {};

	function flatten(obj, prefix = "") {
		let key;
		for (key in obj) {
			let value = obj[key];

			if (value && value.toJSON) {
				value = value.toJSON();
			}

			// we have to check if value is truthy, because `null` is an object
			if (isObject(value)) {
				flatten(value, `${prefix}${key}.`);
			} else if (typeof value !== "function") {
				result[`${prefix}${key}`] = value;
			}
		}
	}

	flatten(object);

	return result;
};
