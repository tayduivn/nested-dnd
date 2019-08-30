const mongo = require("mongoose").mongo;
const debug = require("debug")("app:universe:query");
const sortAncestors = require("instance/util/sortAncestors");

const Universe = require("../Universe");

const getUniverseExplore = async (id, user_id) => {
	const universes = await Universe.aggregate([
		{ $match: { _id: mongo.ObjectId(id), user: user_id } },
		{
			$graphLookup: {
				from: "packs",
				startWith: "$pack",
				connectFromField: "dependencies",
				connectToField: "_id",
				as: "packs"
			}
		},
		{
			$graphLookup: {
				from: "instances",
				startWith: "$last",
				connectFromField: "up",
				connectToField: "_id",
				as: "ancestors"
			}
		},
		{
			$graphLookup: {
				from: "instances",
				startWith: "$last",
				connectFromField: "in",
				connectToField: "_id",
				as: "inArr",
				maxDepth: 2
			}
		}
	]).exec();

	if (!universes.length) return null;
	else {
		const universe = universes[0];
		universes.ancestors = sortAncestors(universe.last, universes.ancestors);
		return universe;
	}
};

const getUniversesByUser = async _id => {
	return await Universe.aggregate([
		{ $match: { user: _id } },
		{
			$graphLookup: {
				from: "packs",
				startWith: "$pack",
				connectFromField: "dependencies",
				connectToField: "_id",
				as: "packs"
			}
		},
		{
			$graphLookup: {
				from: "instances",
				startWith: "$last",
				connectFromField: "up",
				connectToField: "_id",
				as: "array"
			}
		}
	]).exec();
};

function countInstances(nestedArr) {
	let count = nestedArr.length;
	nestedArr.forEach(nest => {
		if (nest.TEMP_IN) {
			count += countInstances(nest.TEMP_IN);
		}
	});
	return count;
}

const allocateSpaceForNewInstances = async function(_id, nestedArr) {
	const toAdd = countInstances(nestedArr);

	// allocate space in the universe count first
	debug("STARTING  Universe.findByIdAndUpdate --- allocateSpaceForNewInstances");
	const u = await Universe.findByIdAndUpdate(_id, { $inc: { count: toAdd } });
	debug("DONE      Universe.findByIdAndUpdate --- allocateSpaceForNewInstances");

	// return the old universe's count, which is the first possible index number
	return u.count;
};

const deleteUniversesByUser = async _id => {
	return await Universe.deleteMany({ user: _id }).exec();
};

module.exports = {
	deleteUniversesByUser,
	getUniversesByUser,
	getUniverseExplore,
	allocateSpaceForNewInstances
};
