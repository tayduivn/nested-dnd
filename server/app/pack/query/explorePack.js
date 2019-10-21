/* eslint-disable max-statements */
const debug = require("debug")("app:pack:query");

const Pack = require("pack/Pack");
const { findTableRecurse } = require("table/query");
const processFlat = require("util/processFlat");
const makeBuiltpack = require("builtpack/makeBuiltpack");
const { getPacksPipeline, getSeedIsaPipeline } = require("./pipeline");
const {
	getGeneratorsFromIsa,
	getChildIsas,
	mergeGens,
	getData
} = require("generator/query/pipeline");
const { getTablesFromTypeValue } = require("table/query/pipeline");

async function explorePack(url, user_id, isa) {
	const pipeline = [
		{ $match: { url: url, _user: user_id } },
		...getPacksPipeline("$dependencies", user_id, ["$_id"]),
		...getSeedIsaPipeline(),
		...getGeneratorsFromIsa("$seedIsa", "$packIds"),
		...getChildIsas(),
		...getGeneratorsFromIsa("$childIsas", "$packIds", "childGens"),
		...mergeGens(["$generators", "$childGens"]),
		...getData("$generators.data"),
		// todo: filter desc/name for actual tables
		...getTablesFromTypeValue(
			[
				"$generators.desc",
				["$generators.name"],
				["$generators.style.icon"],
				"$generators.in",
				["$childIn"]
			],
			user_id
		),
		...getTablesFromTypeValue([["$data.v"]], user_id, "dataTables")
		// {
		// 	$project: {
		// 		childGens: 0,
		// 		childIsas: 0,
		// 		childIn: 0,
		// 		data: 0,
		// 		seedIsa: 0,
		// 		packs: 0
		// 	}
		// }
	];
	debug("STARTING  Pack.aggregate --- explorePack");
	const result = await Pack.aggregate(pipeline);
	debug("    DONE  Pack.aggregate --- explorePack");
	if (!result.length) return null;

	let pack = Pack.hydrate(result[0]);
	let { packs = [], tables = [], generators = [] } = result[0];
	let seeds = pack.seed.split(">");
	const builtpack = makeBuiltpack(pack, generators);
	const seedGens = seeds.map(isa => builtpack.getGen(isa));

	const alreadyFoundIsa = new Set();
	const alreadyFoundTable = new Set();
	generators.map(gen => alreadyFoundIsa.add(gen.isa));
	tables.map(i => alreadyFoundTable.add(i._id.toString()));

	const { toFindIsas, toFindTableIds, usedData } = processFlat();

	// TODO
	// const trimmedData = Array.from(usedData).reduce((trim, name) => {
	// 	trim[name] = ancestorData[name];
	// 	return trim;
	// }, {});
	// //get the tables and gens we use the data
	// processFlat(trimmedData, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds);

	// I dont want to get Isas for allll the generators, but tables is fine
	processFlat(generators, alreadyFoundTable, alreadyFoundIsa, undefined, toFindTableIds);
	processFlat(seedGens, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds);
	processFlat(tables, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds);

	const moreTables = await findTableRecurse(toFindTableIds, alreadyFoundTable);

	return { pack, packs, tables: [...tables, ...moreTables], generators, seeds };
}

module.exports = explorePack;
