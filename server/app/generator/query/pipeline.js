// cannot be a graphLookup because $in can't be in graphLookup
const getGeneratorsFromIsa = (isas = [], packIds = "$packIds", field = "generators") => [
	{
		$lookup: {
			from: "generators",
			as: field,
			let: {
				packs: packIds,
				isaArr: isas
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $in: ["$isa", "$$isaArr"] }, { $in: ["$pack", "$$packs"] }]
						}
					}
				},
				{
					$graphLookup: {
						from: "generators",
						startWith: "$extends",
						connectFromField: "extends",
						connectToField: "isa",
						as: "extendsGen"
					}
				},
				{
					$addFields: {
						extendsGen: {
							$filter: {
								input: "$extendsGen",
								cond: {
									$in: ["$pack", "$$packs"]
								}
							}
						}
					}
				}
			]
		}
	}
];

const getGeneratorsFromPack = (localField = "packIds") => [
	{
		$lookup: { from: "generators", localField: localField, foreignField: "pack", as: "generators" }
	}
];

const getChildIsas = () => [
	{
		$addFields: {
			childIn: {
				$reduce: {
					input: "$generators.in",
					initialValue: [],
					in: {
						$concatArrays: ["$$this", "$$value"]
					}
				}
			}
		}
	},
	{
		$addFields: {
			childIsas: {
				$filter: {
					input: "$childIn",
					as: "item",
					cond: {
						$eq: ["$$item.type", "generator"]
					}
				}
			}
		}
	},
	{
		$addFields: {
			childIsas: {
				$setUnion: ["$childIsas.value", []]
			}
		}
	}
];

const mergeGens = (fields = ["$generators"]) => {
	const pipe = [];

	fields.forEach(field => {
		pipe.push(field, {
			$reduce: {
				input: field + ".extendsGen",
				initialValue: [],
				in: {
					$concatArrays: ["$$this", "$$value"]
				}
			}
		});
	});

	return [
		{
			$addFields: {
				generators: {
					$setUnion: pipe
				}
			}
		}
	];
};

const getData = (input = "$generators.data") => [
	{
		$addFields: {
			data: {
				$reduce: {
					input: {
						$map: {
							input: input,
							as: "data",
							in: {
								$objectToArray: "$$data"
							}
						}
					},
					initialValue: [],
					in: {
						$concatArrays: ["$$this", "$$value"]
					}
				}
			}
		}
	}
];

module.exports = {
	getGeneratorsFromIsa,
	getGeneratorsFromPack,
	getChildIsas,
	mergeGens,
	getData
};
