const Universe = require("universe/Universe");
const { getPacksPipeline } = require("pack/query/pipeline");
const { getGeneratorsFromIsa } = require("generator/query/pipeline");
const { getTablesInPacks } = require("table/query/pipeline");

async function getUniverseInfo(universe_id, user_id) {
	const universe = await Universe.aggregate([
		{ $match: { _id: universe_id, user: user_id } },
		...getPacksPipeline("$pack", user_id),
		...getGeneratorsFromIsa(false, "$packs._id"),
		...getTablesInPacks("packIds")
	]);
	if (!universe.length) return null;
	// TODO: split
	else return universe;
}

module.exports = getUniverseInfo;