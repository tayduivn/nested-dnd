const getPacksPipeline = (startWith, user_id, pack_ids = []) => [
	// recursively lookup all our dependencies
	{
		$graphLookup: {
			from: "packs",
			startWith: startWith || "$pack",
			connectFromField: "dependencies",
			connectToField: "_id",
			as: "packs",
			restrictSearchWithMatch: {
				$or: [{ public: true }, { _user: user_id }]
			}
		}
	},
	// need for $lookups on pack ids
	{
		$addFields: {
			packIds: { $concatArrays: ["$packs._id", pack_ids] }
		}
	}
];

const getSeedIsaPipeline = () => [
	{
		$addFields: {
			seedIsa: {
				$split: ["$seed", ">"]
			}
		}
	}
];

module.exports = {
	getPacksPipeline,
	getSeedIsaPipeline
};
