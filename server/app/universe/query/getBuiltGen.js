/* eslint-disable max-statements */
const debug = require("debug")("app:pack:query");
const Universe = require("../Universe");
const Instance = require("instance/Instance");
const Pack = require("pack/Pack");

const { findTableRecurse } = require("table/query");
const processFlat = require("util/processFlat");
const sortAncestors = require("instance/util/sortAncestors");
const { getPacksPipeline } = require("pack/query/pipeline");
const { getAncestors } = require("instance/query/pipeline");
const { getGeneratorsFromIsa, getChildIsas, mergeGens, getData } = require("generator/query/pipeline");
const { getTablesFromTypeValue } = require("table/query/pipeline");

// eslint-disable-next-line max-statements
/**
 *
 * @param {ObjectId} universe_id
 * @param {ObjectId} user_id
 * @param {ObjectId} up_id
 * @param {Array} isas
 * @param {Set} alreadyFoundIsa
 * @param {Set} alreadyFoundTable
 */
async function getBuiltGen(
	universe_id,
	user_id,
	up_id,
	isas,
	alreadyFoundIsa = new Set(),
	alreadyFoundTable = new Set()
) {
	const aggregation = [
		// get the pack and make sure we have permission to get it
		{ $match: { _id: universe_id, user: user_id } },
		...getPacksPipeline("$pack", user_id),
		...getAncestors(up_id),
		...getGeneratorsFromIsa(isas),
		...getChildIsas(),
		...getGeneratorsFromIsa("$childIsas", "$packIds", "childGens"),
		...mergeGens(["$generators", "$childGens"]),
		...getData("$generators.data"),
		...getTablesFromTypeValue(
			[
				"$generators.desc",
				["$generators.name"],
				["$generators.style.icon"],
				"$generators.in",
				// "$generators.extendsGen.desc",
				// "$generators.extendsGen.name",
				["$data.v"],
				["$childIn"]
			],
			user_id
		),
		// {
		// 	$project: {
		// 		desc: 0,
		// 		packs: 0,
		// 		sourceGenerators: 0,
		// 		extendsGenerators: 0
		// 	}
		// }
	];
	debug("STARTING  Universe.aggregate --- getBuiltGen");
	const array = await Universe.aggregate(aggregation);
	debug("DONE      Pack.aggregate --- getBuiltGen");
	if (!array.length) return null;
	const universe = array[0];
	let { pack, ancestors = [], generators, tables } = universe;
	if (!pack || !ancestors.length) return null;

	ancestors = sortAncestors(up_id, ancestors);
	let up = Instance.hydrate(ancestors[ancestors.length - 1]);
	pack = Pack.hydrate(pack);

	const ancestorData = ancestors.reduce((data, anc = {}) => {
		data = { ...data, ...(anc.data || {}) };
		return data;
	}, {});

	// add strings to our sets
	isas.map(isa => alreadyFoundIsa.add(isa));
	generators.forEach(g => alreadyFoundIsa.add(g.isa));
	tables.forEach(t => alreadyFoundTable.add(t._id.toString()));

	// grab all the isas and tables out of these
	const { toFindIsas, toFindTableIds, usedData } = processFlat(up.toJSON());
	processFlat(generators, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds, usedData);
	processFlat(tables, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds, usedData);

	const trimmedData = Array.from(usedData).reduce((trim, name) => {
		trim[name] = ancestorData[name];
		return trim;
	}, {});
	// only get tables and generators if I'm using that data
	processFlat(trimmedData, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds, true);

	// find those tables!
	let moreTables = await findTableRecurse(toFindTableIds, alreadyFoundTable);
	processFlat(moreTables, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds);
	tables.push(...moreTables);
	// we don't want to recurise on isas this because we'll get the whole tree

	return {
		universe,
		pack,
		generators,
		tables,
		up,
		ancestors,
		ancestorData,
		toFindIsas,
		alreadyFoundTable,
		alreadyFoundIsa
	};
}

module.exports = getBuiltGen;
