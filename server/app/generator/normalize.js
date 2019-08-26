function normalizeGenerators(array = []) {
	let generators = {
		byId: {}
	};
	let idArray = array.map(gen => {
		const id = gen._id.toString();
		generators.byId[id] = gen;
		return id;
	});

	return { generators, idArray };
}

module.exports = { normalizeGenerators };
