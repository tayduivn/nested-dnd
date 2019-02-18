export default function handleNestedPropertyValue(property, value, state) {
	if (typeof property === "string") return { property, value };

	for (var i = property.length - 1; i >= 0; i--) {
		// the top level
		if (i === 0) {
			property = property[i];
			if (state[property] instanceof Array) {
				var newValue = state[property].concat([]);
				newValue.splice(0, value.length, ...value);
				value = newValue;
			} else value = { ...state[property], ...value };
		}

		// the deepest level
		else if (i === property.length - 1) {
			// the value is the new array
			if (property[i] === "sort") {
				var oldIndex = property[--i];
				var newIndex = value;
				var array = state[property[--i]];
				var child = array.splice(oldIndex, 1)[0];
				array.splice(newIndex, 0, child);
				property = property[i];
				value = array;
			} else {
				value = { [property[i]]: value };
			}
		}

		// the middle level
		else {
			var oldValue = state;
			for (var j = 0; j <= i; j++) {
				oldValue = oldValue[property[j]];
			}
			value = { [property[i]]: { ...oldValue, ...value } };
		}
	}

	return { property, value };
}
