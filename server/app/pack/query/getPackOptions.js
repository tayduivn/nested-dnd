const Pack = require("../Pack");

const { getPacksPipeline } = require("./pipeline");
const { getGeneratorsFromPack } = require("generator/query/pipeline");

/**
 * Get all the generators and tables for a pack. Anything that would be an option in a dropdown
 * @param {string} url
 * @param {ObjectId} user_id
 */
async function getPackOptions(url, user_id) {
	const array = await Pack.aggregate([
		// get the pack and make sure we have permission to get it
		{ $match: { url: url, _user: user_id } },
		// recursively lookup all our dependencies
		...getPacksPipeline("$dependencies", user_id, ["$_id"]),
		// get generators
		...getGeneratorsFromPack("packIds"),
		// get tables
		{
			$lookup: {
				from: "tables",
				localField: "packIds",
				foreignField: "pack",
				as: "tables"
			}
		},
		{
			$project: {
				allDeps: 0,
				"generators.desc": 0,
				"generators.in": 0,
				"generators.style": 0,
				"generators.data": 0,
				"generators.name": 0,
				"generators.__v": 0,
				"tables.rows": 0,
				"tables.__v": 0,
				"packs.__v": 0,
				__v: 0
			}
		}
	]);
	if (!array.length) return null;
	// clear out unnecessary fields
	else return { ...array[0], allDeps: undefined };
}

module.exports = getPackOptions;
