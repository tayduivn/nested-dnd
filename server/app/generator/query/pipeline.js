// cannot be recursive because $in cannot be used recursively
const getSourceGenerators = (isas = false, packIds) => [
	{
		$lookup: {
			from: "generators",
			let: { packs: packIds },
			pipeline: [
				{
					$match: {
						isa: isas ? { $in: isas } : { $exists: true },
						$expr: { $in: ["$pack", "$$packs"] }
					}
				}
			]
		}
	}
];

module.exports = {
	getSourceGenerators
};
