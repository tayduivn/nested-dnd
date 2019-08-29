const Pack = require("../Pack");

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
		{
			$graphLookup: {
				from: "packs",
				startWith: "$dependencies",
				connectFromField: "dependencies",
				connectToField: "_id",
				as: "packs"
			}
		},
		// join all the pack ids together so we can graph lookup on it
		{ $addFields: { allDeps: { $concatArrays: ["$dependencies", ["$_id"]] } } },
		// get generators
		{
			$lookup: { from: "generators", localField: "allDeps", foreignField: "pack", as: "generators" }
		},
		// get tables
		{
			$lookup: {
				from: "tables",
				localField: "allDeps",
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
