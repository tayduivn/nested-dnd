const debug = require("debug")("app:instance:query");
const Instance = require("../Instance");
const processFlat = require("util/processFlat");
const makeBuiltpack = require("builtpack/makeBuiltpack");
const getBuiltGen = require("../../universe/query/getBuiltGen");
const { findTableRecurse } = require("table/query");
const sortAncestors = require("instance/util/sortAncestors");

const pipeline = (universe_id, index, user_id) => [
	{
		$match: { univ: universe_id, n: index }
	},
	// get universe
	{
		$lookup: {
			from: "universes",
			as: "universe",
			pipeline: [{ $match: { _id: universe_id, user: user_id } }]
		}
	},
	// get pack
	{
		$lookup: {
			from: "packs",
			localField: "universe.0.pack",
			foreignField: "_id",
			as: "pack"
		}
	},
	// flatten universe and pack & mark if item is todo
	{
		$addFields: {
			pack: { $arrayElemAt: ["$pack", 0] },
			universe: { $arrayElemAt: ["$universe", 0] }
		}
	},

	// find ancestors
	{
		$graphLookup: {
			from: "instances",
			startWith: "$_id",
			connectFromField: "up",
			connectToField: "_id",
			as: "ancestors"
		}
	},
	// find descendants
	{
		$graphLookup: {
			from: "instances",
			startWith: "$_id",
			connectFromField: "in",
			connectToField: "_id",
			as: "inArr",
			maxDepth: 2
		}
	},
	// -------------- if item is todo -----------------------
	// can't merge this step with other addFields because it depends on it
	{
		$addFields: {
			todoItem: {
				$cond: {
					if: "$todo",
					then: { isa: "$isa", pack: "$pack._id" },
					else: null
				}
			}
		}
	},
	// get all the packs
	{
		$graphLookup: {
			from: "packs",
			startWith: "$todoItem.pack",
			connectFromField: "dependencies",
			connectToField: "_id",
			as: "packs"
		}
	}, // join all the pack ids together so we can graph lookup on it
	{
		$addFields: {
			packs: { $concatArrays: ["$packs._id", ["$todoItem.pack"]] }
		}
	},
	{
		// look up the genrators for this todo item
		$lookup: {
			from: "generators",
			as: "sourceGenerators",
			let: { packs: "$packs", todoIsa: ["$todoItem.isa"] },
			pipeline: [
				{
					$match: {
						$expr: { $in: ["$isa", "$$todoIsa"] }
					}
				},
				{
					$match: {
						$expr: { $in: ["$pack", "$$packs"] }
					}
				}
			]
		}
	},
	// get extends
	{
		$graphLookup: {
			from: "generators",
			startWith: "$sourceGenerators",
			connectFromField: "extends",
			connectToField: "isa",
			as: "extendGens"
		}
	},
	// merge extends
	{
		$addFields: {
			generators: { $concatArrays: ["$extendGens", "$sourceGenerators"] }
		}
	},
	{
		$project: {
			packs: 0, // only needed this to get the generators
			sourceGenerators: 0,
			extendsGenerators: 0
		}
	}
];

/**
 * @param {ObjectId} universe_id
 * @param {number} index
 * @param {ObjectId} user_id
 */
// eslint-disable-next-line max-statements
async function getInstanceByIndex(universe_id, index, user_id) {
	debug("STARTING  Instance.aggregate --- getInstanceByIndex");

	const array = await Instance.aggregate(pipeline(universe_id, index, user_id));
	debug("DONE      Instance.aggregate --- getInstanceByIndex");

	if (!array.length) return null;

	let instance = array[0];
	let { pack, generators, universe, ancestors, descendents } = instance;
	ancestors = sortAncestors(instance._id, ancestors);
	generators = [...generators];
	instance = Instance.hydrate(instance);

	if (!instance.todo) {
		return { instance, pack, universe, ancestors, descendents };
	}
	if (instance.todo && instance.in) {
		debug(`Something has gone wrong! This instance is marked as todo but already has an in!`);
		return { instance, pack, universe, ancestors, descendents };
	}

	// get generator stuff for in
	if (instance.todo && !instance.in) {
		// we need to merge definitions together so we can get what the in should be
		const builtpack = makeBuiltpack(pack, generators);
		const generator = builtpack.getGen(instance.isa);
		const inArrGenerator = generator.in;
		const alreadyFoundIsas = new Set();
		const alreadyFoundTables = new Set();
		alreadyFoundIsas.add(instance.isa);
		let ancestorData = ancestors.reduce((data, anc = {}) => {
			data = { ...data, ...(anc.data || {}) };
			return data;
		}, {});

		const {
			toFindIsas,
			toFindTableIds,
			alreadyFoundTable,
			alreadyFoundIsa,
			usedData
		} = processFlat(inArrGenerator);
		const trimmedData = Array.from(usedData).reduce((trim, name) => {
			trim[name] = ancestorData[name];
			return trim;
		}, {});
		//get the tables and gens we use the data
		processFlat(trimmedData, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds);

		// get tables in the `in` definiton
		const tables = await findTableRecurse(toFindTableIds, alreadyFoundTables);
		processFlat(tables, alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds);

		const builtGenResults = await getBuiltGen(
			universe_id,
			user_id,
			instance._id,
			Array.from(toFindIsas),
			alreadyFoundTables,
			alreadyFoundIsas
		);

		return {
			instance,
			pack,
			universe,
			ancestors,
			descendents,
			ancestorData,
			generators: [...generators, ...builtGenResults.generators],
			tables: [...tables, ...builtGenResults.tables],
			todo: true
		};
	}
}
module.exports = getInstanceByIndex;
