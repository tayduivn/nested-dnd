const { normalizeTables } = require("../table/normalize");

const normalizePacks = (packs, user_id) => {
	const result = {
		data: [],
		included: []
	};

	result.data = packs.map(item => {
		// push the pack name into the dependencies for display
		const { data, included } = normalizePack(item, user_id);
		result.included.push(...included);
		return data;
	});

	return result;
};

function normalizePack(p, user_id) {
	if (!p) return null;

	let pack = p.toJSON ? p.toJSON() : p;

	let result = {
		data: {
			type: "Pack",
			id: pack._id,
			attributes: { ...pack, _id: undefined, __v: undefined }
		},
		included: [],
		related: {}
	};

	// we need to send this back so we can generate the My Universes and Public universes
	result.data.attributes.owned = pack._user && pack._user.equals(user_id);

	// dependencies
	if (pack.packs) {
		let { data, included } = normalizePacks(pack.packs);
		result.included.push(...data, ...included);
		delete result.data.attributes.packs;
	}
	if (pack.tables) {
		result.related.tables = pack.tables.map(t => t._id);
		let { data, included } = normalizeTables(pack.tables);
		result.included.push(...data, ...included);
		delete result.data.attributes.tables;
	}
	if (pack.generators) {
		// only send the names + extends data
		// we don't need to do anything with the generator data unless we're editing or viewing it
		// that generator specifically
		// we need the extends data for the pack preview
		// we expect these generators to be sorted in dependency order!
		const nameSet = pack.generators.reduce((map, g) => {
			if (!map[g.isa]) map[g.isa] = "";
			if (g.extends) map[g.isa] = g.extends;
			return map;
		}, {});
		result.related.generators = nameSet;

		delete result.data.attributes.generators;
	}
	return result;
}

module.exports = {
	normalizePacks,
	normalizePack
};
