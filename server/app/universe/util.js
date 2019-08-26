function saveInstance(index, newValues, universe) {
	const newChanges = {};

	// move
	if (typeof newValues.up !== "undefined") {
		const oldUp = universe.array[index].up;

		//do the move
		universe.moveInstance(index, newValues.up);

		// return changed instances
		newChanges[newValues.up] = universe.array[newValues.up].toJSON();
		newChanges[oldUp] = universe.array[oldUp].toJSON();

		delete newValues.up;
	}

	// set favorite
	if (typeof newValues.isFavorite !== "undefined") {
		universe.setFavorite(index, newValues.isFavorite);
		delete newValues.isFavorite;
	}

	// delete
	if (newValues.delete) {
		const oldLength = universe.array.length;
		const { length, emptyIndexes } = universe.deleteInstance(index) || {};

		// send all the empties that are now null
		emptyIndexes.forEach(i => (newChanges[i] = null));
		// send all the stripped off from the end are null
		for (let i = length; i < oldLength; i++) newChanges[i] = null;
	}

	// edit
	else if (universe.array[index]) {
		const newInstance = { ...universe.array[index].toJSON(), ...newValues };
		universe.array.set(index, newInstance);
		// if it's not deleted, send the result
		newChanges[index] = universe.array[index].toJSON();
	}

	return newChanges;
}

module.exports = { saveInstance };
