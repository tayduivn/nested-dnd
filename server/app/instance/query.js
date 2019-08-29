const Instance = require("./Instance");
const ObjectId = require("mongoose").mongo.ObjectID;

const { getUniverseExplore } = require("../universe/query");

/**
 * @param {string} univ
 * @param {string} index
 * @param {ObjectId} user_id
 */
async function getInstanceByIndex(univ, index, user_id) {
	const array = await Instance.aggregate([
		{
			$match: { univ: ObjectId(univ), n: parseInt(index, 10) }
		},

		{
			$lookup: {
				from: "universes",
				as: "universe",
				pipeline: [{ $match: { _id: ObjectId(univ), user: user_id } }]
			}
		},
		{
			$lookup: {
				from: "packs",
				localField: "universe.0.pack",
				foreignField: "_id",
				as: "pack"
			}
		},
		{
			$graphLookup: {
				from: "instances",
				startWith: "$_id",
				connectFromField: "up",
				connectToField: "_id",
				as: "ancestors"
			}
		},
		{
			$graphLookup: {
				from: "instances",
				startWith: "$_id",
				connectFromField: "in",
				connectToField: "_id",
				as: "inArr",
				maxDepth: 2
			}
		}
	]);
	if (array.length) {
		const instance = array[0];
		instance.pack = instance.pack && instance.pack[0];
		instance.universe = instance.universe && instance.universe[0];
		return instance;
	} else return null;
}

async function getInstanceFromUniverse(univ, user_id) {
	let universe = await getUniverseExplore(univ, user_id);

	// get rid of the duplicate $last result
	const instance = universe.ancestors[universe.ancestors.length - 1];
	universe.ancestors.splice(universe.ancestors.length - 1, 1);
	universe.inArr.splice(universe.inArr.length - 1, 1);
	instance.universe = {
		...universe,
		array: [...universe.inArr, ...universe.ancestors],
		inArr: undefined,
		ancestors: undefined
	};

	return instance;
}

const updateInstance = async (universe_id, _id, data) => {
	return await Instance.updateOne({ univ: universe_id, _id: ObjectId(_id) }, data).exec();
};

module.exports = { getInstanceByIndex, getInstanceFromUniverse, updateInstance };
