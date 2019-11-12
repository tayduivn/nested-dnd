const debug = require("debug")("app:universe:query");
const sortAncestors = require("instance/util/sortAncestors");

const Universe = require("../Universe");
const { getPacksPipeline } = require("pack/query/pipeline");
const { getAncestors, getAncestorsAndDescendents } = require("instance/query/pipeline");

/**
 * From a universe id, get the last saw instance and return
 *
 * @param {ObjectId} _id The id of a universe
 * @param {ObjectId} user_id
 */
const getUniverseExplore = async (_id, user_id) => {
	const pipeline = [
		{ $match: { _id: _id, user: user_id } },
		...getPacksPipeline("$pack", user_id),
		...getAncestorsAndDescendents("$last", "$last", 2)
	];
	const universes = await Universe.aggregate(pipeline).exec();

	if (!universes.length) return null;
	else {
		const universe = universes[0];
		universe.ancestors = sortAncestors(universe.last, universe.ancestors);
		universe.pack = universe.packs.find(({ _id }) => _id.equals(universe.pack));
		return universe;
	}
};

const getUniversesByUser = async user_id => {
	const pipeline = [
		{ $match: { user: user_id } },
		...getPacksPipeline("$pack", user_id),
		...getAncestors("$last", "instances")
	];
	return await Universe.aggregate(pipeline).exec();
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
