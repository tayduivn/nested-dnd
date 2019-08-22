const normalizePacks = require("./normalizePacks");
const normalizeGenerators = require("./normalizeGenerators");

module.exports = function normalizePack(pack) {
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
};
