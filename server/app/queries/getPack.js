const BuiltPack = require("../models/builtpack");
const Table = require("../models/table");
const { Generator } = require("../models/generator");

async function getPack(pack, user) {
	var isOwner = !!pack.universe_id || (user && pack._user.id === user.id);
	if (!pack.id) return { ...pack.toJSON() };

	// run getGen so correct format
	var generators = {};
	const builtpack = await BuiltPack.findOrBuild(pack);
	for (var isa in builtpack.generators) {
		generators[isa] = builtpack.getGen(isa);
	}

	const allPackIds = pack.dependencies.concat([pack.id]);
	let originalGen = builtpack.originalGen
		? builtpack.originalGen
		: await Generator.find({ pack: { $in: allPackIds } }).exec();

	// get tables
	var tables = await Table.find({ pack: pack.id })
		.select("id title returns")
		.exec();
	tables.sort((a, b) => a.title.localeCompare(b.title));

	return {
		...pack.toJSON(),
		generators,
		originalGen,
		tables,
		isOwner,
		partial: false
	};
}

module.exports = getPack;
