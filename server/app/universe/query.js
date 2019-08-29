const mongo = require("mongoose").mongo;

const Universe = require("./Universe");

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
	else return universes[0];
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

const deleteUniversesByUser = async _id => {
	return await Universe.deleteMany({ user: _id }).exec();
};

module.exports = { deleteUniversesByUser, getUniversesByUser, getUniverseExplore };
