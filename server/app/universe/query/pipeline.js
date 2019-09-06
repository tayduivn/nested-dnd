const getUniverse = (universe_id, user_id) => [
	{
		$lookup: {
			from: "universes",
			as: "universe",
			pipeline: [{ $match: { _id: universe_id, user: user_id } }]
		}
	},
	{
		$addFields: {
			universe: { $arrayElemAt: ["$universe", 0] }
		}
	}
];
module.exports = { getUniverse };
