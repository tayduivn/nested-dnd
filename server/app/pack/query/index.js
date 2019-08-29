const BuiltPack = require("../../builtpack/BuiltPack");
const Table = require("../../table/Table");
const Pack = require("../Pack");
const { Generator } = require("../../generator/Generator");

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

async function getAllPacks(user) {
	let query;
	if (user) {
		query = Pack.find().or([{ public: true }, { _user: user }]);
	} else {
		query = Pack.find({ public: true });
	}

	//get public packs
	return await query.exec();
}

const getPackOptions = require("./getPackOptions");
module.exports = { getPack, getAllPacks, getPackOptions };
