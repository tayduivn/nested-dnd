function setLastSaw(index, universe) {
	if (index !== undefined && index.length) {
		const oldLastSaw = universe.lastSaw;
		universe.setLastSaw(index);
		if (universe.lastSaw !== oldLastSaw) universe.save();
	}
	return universe.lastSaw;
}

function stringify(type = "", data = {}, meta = {}) {
	return JSON.stringify({ type, data, meta }) + "\n";
}

function normalUniverseResponse(u, index) {
	let sent = [];
	let firstBatch = {};
	const universe = u.toObject();

	// send requested index
	const current = universe.array[index];
	// we have generated the containing elements already
	current.todo = false;
	firstBatch[index] = current;
	sent.push(index);

	// send children
	current.in &&
		current.in.forEach(i => {
			firstBatch[i] = universe.array[i];
			sent.push(i);
		});

	// send ancestors
	let ancestorIndex = current.up;
	while (ancestorIndex !== undefined) {
		const ancestor = universe.array[ancestorIndex];
		firstBatch[ancestorIndex] = ancestor;
		sent.push(ancestorIndex);
		ancestorIndex = ancestor.up;
	}
	return firstBatch;
}

module.exports = {
	normalUniverseResponse,
	stringify,
	setLastSaw
};
