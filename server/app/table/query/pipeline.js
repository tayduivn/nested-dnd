const getTablesInPacks = (localField = "packIds") => [
	{
		$lookup: {
			from: "tables",
			as: "tables",
			localField: localField,
			foreignField: "pack"
		}
	}
];

const getTablesFromTypeValue = (arrays = [], user_id, field = "tables") => [
	// this gets all the "values" from our various tables and filters for table_ids
	{
		$addFields: {
			[field]: {
				$filter: {
					input: {
						$reduce: {
							input: {
								$concatArrays: arrays
							},
							initialValue: [],
							in: {
								$concatArrays: ["$$value", "$$this"]
							}
						}
					},
					as: "d",
					cond: {
						$eq: ["$$d.type", "table_id"]
					}
				}
			}
		}
	},
	// make unique
	{
		$addFields: {
			tables: {
				$setUnion: ["$tables.value", []]
			}
		}
	},
	// a false positive on the _id is near impossible but
	// technically you could look up an extra erroneous table
	// but it won't be referenced, so won't cause an error
	{
		$graphLookup: {
			from: "tables",
			startWith: "$tables",
			connectFromField: "rows.value",
			connectToField: "_id",
			as: "tables",
			restrictSearchWithMatch: {
				$or: [{ public: true }, { user: user_id }]
			}
		}
	}
];

module.exports = {
	getTablesInPacks,
	getTablesFromTypeValue
};
