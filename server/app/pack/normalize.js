// normalize an array of packs, always partial
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
	/*
	const byId = {};
	const byUrl = {};
	const idArray = [];

	for (var i = 0; i < packs.length; i++) {
		let pack = packs[i];

		pack.partial = true;

		if (pack._id) {
			const id = pack._id.toString();
			idArray.push(id);
			byId[id] = pack;
			byUrl[pack.url] = id;
			packs[i] = id;
		}
	}
	return {
		byId,
		byUrl,
		idArray
	};*/
};

function normalizePack(p, user_id) {
	let pack = p.toJSON ? p.toJSON() : p;

	let result = {
		data: {
			type: "Pack",
			id: pack._id,
			attributes: pack
		},
		included: []
	};
	delete result.data.attributes._id;
	delete result.data.attributes.__v;

	result.data.attributes.owned = pack._user && pack._user.equals(user_id);
	/*
	let packs = {
		byId: {},
		byUrl: {}
	};

	if (pack.dependencies && pack.dependencies.length) {
		let { byId, byUrl } = normalizePacks(pack.dependencies);
		packs.byId = byId;
		packs.byUrl = byUrl;
	}

	let tables = {};
	if (pack.tables) {
		pack.tables = pack.tables.map(t => {
			let id = t._id.toString();
			tables[id] = t;
			return id;
		});
	}

	let generators = {};
	if (pack.originalGen) {
		const normalGens = normalizeGenerators(pack.originalGen);
		generators = normalGens.generators;
		pack.originalGen = normalGens.idArray;
	}

	const id = pack._id.toString();
	packs.byId[id] = pack;
	packs.byUrl[pack.url] = id;

	return { generators, packs, tables };
	*/
	return result;
}

module.exports = {
	normalizePacks,
	normalizePack
};
