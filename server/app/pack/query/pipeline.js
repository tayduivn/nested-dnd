const getPacksPipeline = (pack_id, user_id) => [
	// recursively lookup all our dependencies
	{
		$graphLookup: {
			from: "packs",
			startWith: pack_id || "pack",
			connectFromField: "dependencies",
			connectToField: "_id",
			as: "packs",
			restrictSearchWithMatch: {
				$or: [{ public: true }, { _user: user_id }]
			}
		}
	}
];

module.exports = {
	getPacksPipeline
};
