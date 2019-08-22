const normalizePack = require("./normalizePack");

function normalizeArray({ array, lastSaw }) {
	if (!array) return {};

	// include lastsaw
	const newArray = {};
	let lastSawInst = array[lastSaw];

	if (lastSawInst) {
		if (lastSawInst.up && lastSawInst.up.length) {
			lastSawInst.up.forEach(i => (newArray[i.index] = i));
			lastSawInst.up = lastSawInst.up[0].index;
		}
		if (lastSawInst.in && lastSawInst.in.length) {
			// filter out null children
			lastSawInst.in = lastSawInst.in.filter(child => child);
			lastSawInst.in.forEach(i => (newArray[i.index] = { ...i, up: lastSaw.index }));
			lastSawInst.in = lastSawInst.in.map(c => c.index);
		}
		newArray[lastSawInst.index] = lastSawInst;
	}

	return newArray;
}

module.exports = function normalizeUniverse(universe) {
	var u = universe.toJSON ? universe.toJSON() : universe;

	if (u.favorites) {
		u.favorites = u.favorites.map(i => {
			if (!u.array[i]) return {};
			return {
				name: u.array[i].name || u.array[i].isa,
				index: i
			};
		});
	}

	// normalize
	let { packs, tables, generators } = normalizePack(u.pack);

	u.pack = u.pack._id;

	u.array = normalizeArray(u);

	u.partial = true;

	return {
		universe: u,
		packs,
		tables,
		generators
	};
};
